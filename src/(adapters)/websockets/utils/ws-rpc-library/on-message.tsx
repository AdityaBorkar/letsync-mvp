import { ArkErrors, type Type } from "arktype"

import { Logger } from "../../../../utils/logger.js"
import { createWsHandlerContext, type LimitedWs } from "./create-ws-context.js"
import type { RequestStore } from "./request-store.js"
import type { WsHandlerType, WsMsgType } from "./type-helpers.js"

const logger = new Logger("WS-RPC")

export function onMessage<
  Context,
  Ws extends LimitedWs,
  Message extends Type<WsMsgType>
>(
  msg: Buffer | string,
  _context: {
    MsgSchema: Message
    context: Context
    handlers: Record<string, WsHandlerType<any, string, Context>>
    actor_env: "client" | "server"
    ReqManager: ReturnType<typeof RequestStore>
    ws: Ws
  }
) {
  // Context
  const { actor_env, handlers, context, ReqManager, ws, MsgSchema } = _context

  // Validation
  const msg_string = msg.toString()
  const message = MsgSchema(JSON.parse(msg_string))
  if (message instanceof ArkErrors) {
    logger.log("Invalid Message", { error: message.join("\n"), msg_string })
    throw new Error("Invalid Message")
  }

  // Message
  const { type, requestId, payload } = message
  const [actor, method, event] = type.split(".")

  // Handling
  if (actor !== actor_env) {
    if (event === "get") {
      const handler = handlers[method]
      if (!handler) {
        throw new Error(`Handler not found for type: ${type}`)
      }
      const { emit, ctx } = createWsHandlerContext({
        actor_env,
        context,
        MsgSchema,
        message,
        ReqManager,
        ws
      })
      handler(payload, emit, ctx)
    } else {
      const request = ReqManager.get(requestId)
      if (!request) {
        console.log("Request not found: ", { message })
        throw new Error(`Request ${requestId} not found`)
      }
      for (const callback of request.callbacks) {
        callback(message)
      }
    }
  }
}
