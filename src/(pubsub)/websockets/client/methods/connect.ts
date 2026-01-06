import { ArkErrors } from "arktype"

import type { Context } from "@/core/client/config.js"

// import { CURSOR_KEY } from "../../../../core/client/constants.js"
import { Logger } from "../../../../utils/logger.js"
import {
  WsMessageSchema,
  type WsMessageType
} from "../../utils/contract/index.js"
import { RequestStore } from "../../utils/request-store.js"
import type { ClientState } from "../index.js"
import { createWsContext } from "../utils/create-ws-context.js"

// import { cdcCache } from "../messages/cdc-cache.js"
// import { cdcRecords } from "../messages/cdc-records.js"

const client_contract = {}

export function connect(props: {
  client: ClientState
  wsUrl: string | undefined
  context: Omit<Context, "status" | "fetch">
}) {
  const logger = new Logger("SYNC:WS")

  const { client, context } = props
  const reqManager = RequestStore()
  const ws = new window.WebSocket(props.wsUrl || "")

  context.controller.signal.addEventListener("abort", () => ws.close())
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

  ws.onmessage = ({ data: msg }) => {
    // Validation
    const msg_string = msg.toString()
    const message = WsMessageSchema(JSON.parse(msg_string))
    if (message instanceof ArkErrors) {
      logger.log("Invalid Message", { error: message.join("\n"), msg_string })
      throw new Error("Invalid Message")
    }

    const { type, requestId, payload } = message
    const [actor, method, event] = type.split(".")

    if (actor === "server") {
      if (event === "result" || event === "stream") {
        const request = reqManager.get(requestId)
        if (request) {
          // @ts-expect-error
          request.callback({ payload, requestId, type })
        } else {
          console.error("Request not found", requestId)
        }
      } else if (event === "get") {
        const handler = client_contract[method as keyof typeof client_contract]
        if (!handler) {
          console.error("Handler not found", type)
          throw new Error("Handler not found")
        }
        // @ts-expect-error
        handler(payload, createWsContext({ context, requestId, ws }))
      }
      return
    }
  }
  ws.onopen = async () => {
    console.log("Websockets: Connected")
    client.set(ws)

    const message = {
      messageId: "null",
      payload: null,
      requestId: "null",
      type: "null"
    } as unknown as WsMessageType
    const ws_ctx = createWsContext({ context, message, reqManager, ws })

    const ping = await ws_ctx.rpc("ping", null)
    if (!ping) {
      throw new Error("Ping failed")
    }
    const latency = Date.now() - ping.server_ts
    logger.log("Latency", { latency })

    // for await (const [_, database] of context.db.entries()) {
    //   const name = database.name
    //   const timestamp = (await database.metadata.get(CURSOR_KEY)) as string
    //   const cursor = timestamp ? new Date(timestamp).toString() : null
    //   wsContext.rpc("cdc", { cursor, name })
    // }

    // for await (const [_, filesystem] of fs.entries()) {
    //   const name = filesystem.name
    //   wsContext.rpc("cdc", { name })
    // }
  }
}
