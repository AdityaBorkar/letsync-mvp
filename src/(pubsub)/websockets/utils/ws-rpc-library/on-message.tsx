import { ArkErrors } from "arktype"

import { Logger } from "../../../../utils/logger.js"
import { WsMessageSchema } from "../contract.js"
import type { RequestStore } from "../request-store.js"
import { createWsHandlerContext } from "./create-ws-context.js"

const logger = new Logger("WS-RPC")

export function onMessage<Context>(
  msg: Buffer | string,
  _context: {
    context: Context
    handlers: Record<string, (payload: unknown, ctx: unknown) => void>
    actor_env: "client" | "server"
    reqManager: ReturnType<typeof RequestStore>
    ws: WebSocket
  }
) {
  // Context
  const { actor_env, handlers, reqManager, ws, context } = _context

  // Validation
  const msg_string = msg.toString()
  const message = WsMessageSchema(JSON.parse(msg_string))
  if (message instanceof ArkErrors) {
    logger.log("Invalid Message", { error: message.join("\n"), msg_string })
    throw new Error("Invalid Message")
  }

  // Message
  const { type, requestId, payload } = message
  const [actor, method, event] = type.split(".")

  // Handling
  if (actor === actor_env) {
    if (event === "result" || event === "stream") {
      const request = reqManager.get(requestId)
      if (request) {
        // @ts-expect-error
        request.callback({ payload, requestId, type })
      } else {
        console.error("Request not found", requestId)
      }
    } else if (event === "get") {
      const handler = handlers[method]
      if (!handler) {
        logger.error("Handler not found", { type })
        throw new Error("Handler not found")
      }
      const ctx = createWsHandlerContext({ context, message, reqManager, ws })
      handler(payload, ctx)
    }
    return
  }
}
