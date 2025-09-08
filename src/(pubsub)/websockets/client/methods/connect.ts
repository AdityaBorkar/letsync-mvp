import { ArkErrors } from "arktype"

import type { Context } from "@/client/config.js"

import { Logger } from "../../../../utils/logger.js"
import { generateRefId } from "../../utils/generate-ref-id.js"
import type {
  ServerRpcMessage,
  ServerRpcMessageData
} from "../../ws-server/schemas.js"
import type { ClientState } from "../index.js"
import { cdcCache } from "../messages/cdc-cache.js"
import { cdcRecords } from "../messages/cdc-records.js"
import { pong } from "../messages/pong.js"
import { RequestStore } from "../request-store.js"
import { ClientRpcSchema } from "../schemas.js"

export type WebsocketContext = Omit<Context, "status" | "fetch"> & {
  end: () => void
  rpc<T extends ServerRpcMessage["type"]>(
    type: T,
    data?: ServerRpcMessageData<T>["data"]
  ): Promise<unknown[]>
}

export function connect(props: {
  client: ClientState
  method: string
  wsUrl: string | undefined
  context: Omit<Context, "status" | "fetch">
}) {
  const logger = new Logger("SYNC:WS")

  const { client, method, wsUrl, context } = props
  const { apiUrl, controller } = context
  if (method !== "ws") {
    throw new Error("Methods other than `ws` are not supported yet!")
  }

  console.log("Connecting websocket")
  const ws = new window.WebSocket(
    wsUrl ||
      `${apiUrl.https ? "wss" : "ws"}://${apiUrl.domain}/${apiUrl.path}/ws`
  )
  controller.signal.addEventListener("abort", () => ws.close())
  client.set(ws)
  const RequestManager = RequestStore()

  const wsContext: WebsocketContext = {
    ...context,
    end: () => {
      const refId = generateRefId()
      ws.send(JSON.stringify({ refId, type: "-- END --" }))
    },
    rpc(type, data) {
      return new Promise<unknown[]>((resolve) => {
        const refId = generateRefId()

        const response: unknown[] = []
        const callback = ({ type, data }: { type: string; data: unknown }) => {
          if (type === "-- END --") {
            RequestManager.markAsResolved(refId)
            response.push(data)
            resolve(response)
          } else if (type === "-- STREAM --") {
            response.push(data)
          } else {
            console.error("Invalid message type for refId", refId)
          }
        }

        RequestManager.add({ callback, refId })
        ws.send(JSON.stringify({ data, refId, type }))
      })
    }
  }

  ws.onopen = async () => {
    const result = await wsContext.rpc("ping", {})
    console.log({ result })

    // for await (const [_, database] of db.entries()) {
    //   const name = database.name
    //   const timestamp = (await database.metadata.get(CURSOR_KEY)) as string
    //   const cursor = timestamp ? new Date(timestamp).toString() : null
    //   wsContext.rpc("sync-request", { cursor, name })
    // }

    // for await (const [_, filesystem] of fs.entries()) {
    //   const name = filesystem.name
    //   wsContext.rpc("sync-request", { name })
    // }
  }

  ws.onmessage = ({ data: msg }) => {
    const message = ClientRpcSchema(JSON.parse(msg))
    if (message instanceof ArkErrors) {
      console.log({ message, msg })
      logger.error("Invalid Message", message)
      return
    }

    const { type, refId, data } = message
    if (!type) {
      const request = RequestManager.get(refId)
      if (!request) {
        console.error("Request not found", refId)
      }
      request?.callback({ data, type })
    } else if (type === "pong") {
      pong.handler(data, wsContext)
    } else if (type === "cdc-cache") {
      cdcCache.handler(data, wsContext)
    } else if (type === "cdc-records") {
      cdcRecords.handler(data, wsContext)
    }
  }

  ws.onerror = (error) => {
    logger.error("Connection Error", error)
    // TODO: Handle UNAUTHORIZED
    // TODO: Report Status
  }

  ws.onclose = () => {
    logger.log("Connection Closed")
    // TODO: Report Status
    client.set(null)
  }
}
