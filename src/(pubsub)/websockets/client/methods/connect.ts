import { ArkErrors } from "arktype"

import type { Context } from "@/core/client/config.ts"

import { CURSOR_KEY } from "../../../../core/client/constants.ts"
import { Logger } from "../../../../utils/logger.ts"
import { createWsContext } from "../../utils/create-ws-context.ts"
import { RequestStore } from "../../utils/request-store.ts"
import type { ServerRpcMessage } from "../../ws-server/schemas.ts"
import type { ClientState } from "../index.ts"
import { cdcCache } from "../messages/cdc-cache.ts"
import { cdcRecords } from "../messages/cdc-records.ts"
import { ClientRpcSchema } from "../schemas.ts"

type ContextType = Omit<Context, "status" | "fetch">

export type WsContext = ReturnType<
  typeof createWsContext<WebSocket, ContextType, ServerRpcMessage>
>

export function connect(props: {
  client: ClientState
  method: string
  wsUrl: string | undefined
  context: ContextType
}) {
  const logger = new Logger("SYNC:WS")

  const { client, method, wsUrl, context } = props
  const { apiUrl, controller } = context
  if (method !== "ws") {
    throw new Error("Methods other than `ws` are not supported yet!")
  }

  console.log("Websocket: Connecting")
  const ws = new window.WebSocket(
    wsUrl ||
      `${apiUrl.https ? "wss" : "ws"}://${apiUrl.domain}/${apiUrl.path}/ws`
  )
  controller.signal.addEventListener("abort", () => ws.close())
  client.set(ws)
  const RequestManager = RequestStore()

  const wsContext = createWsContext<WebSocket, ContextType, ServerRpcMessage>({
    context,
    RequestManager,
    requestId: crypto.randomUUID(),
    ws
  })

  ws.onopen = async () => {
    console.log("Websockets: Connected")

    const ping = await wsContext.rpc("ping")
    // @ts-expect-error
    const latency = Date.now() - Number(ping.timestamp)
    console.log(`Latency: ${latency}ms`)

    for await (const [_, database] of context.db.entries()) {
      const name = database.name
      const timestamp = (await database.metadata.get(CURSOR_KEY)) as string
      const cursor = timestamp ? new Date(timestamp).toString() : null
      wsContext.rpc("sync-request", { cursor, name })
    }

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

    const { type, requestId, data } = message
    if (type === "-- END --" || type === "-- STREAM --") {
      const request = RequestManager.get(requestId)
      if (!request) {
        console.error("Request not found", requestId)
      }
      request?.callback({ data, requestId, type })
    } else if (type === "cdc-cache") {
      cdcCache.handler(data, wsContext)
    } else if (type === "cdc-records") {
      cdcRecords.handler(data, wsContext)
    }
  }

  ws.onerror = (error) => {
    logger.error("Websocket: Connection Error", error)
    // TODO: Handle UNAUTHORIZED
    // TODO: Report Status
  }

  ws.onclose = () => {
    logger.log("Websocket: Connection Closed")
    // TODO: Report Status
    client.set(null)
  }
}
