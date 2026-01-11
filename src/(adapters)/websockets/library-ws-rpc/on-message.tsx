import { ArkErrors, type Type } from "arktype"

import { createWsHandlerContext, type LimitedWs } from "./create-ws-context.js"
import type { RequestStore } from "./request-store.js"
import type { WsHandlerType, WsMsgType } from "./type-helpers.js"

export function onMessage<
  Context,
  Ws extends LimitedWs,
  Message extends Type<WsMsgType>
>(
  msg: Buffer | string,
  _context: {
    MsgSchema: Message
    system_callbacks: ((message: WsMsgType) => void)[]
    context: Context
    handlers: Record<string, WsHandlerType<any, string, Context>>
    actor_env: "client" | "server"
    ReqManager: ReturnType<typeof RequestStore>
    ws: Ws
  }
) {
  // Context
  const {
    actor_env,
    handlers,
    context,
    ReqManager,
    ws,
    MsgSchema,
    system_callbacks
  } = _context

  // Validation
  const msg_string = msg.toString()
  const message = MsgSchema(JSON.parse(msg_string))
  if (message instanceof ArkErrors) {
    throw new Error(`Invalid Message: ${message.join("\n")}`, {
      cause: msg_string
    })
  }

  // Message
  const { type, requestId, payload } = message
  const [actor, method, event] = type.split(".")

  // Handling
  if (actor.includes("system")) {
    if (actor !== `${actor_env}-system`) {
      console.log("Possible Bug: Actor mismatch for", { message })
      return
    }
    for (const callback of system_callbacks) {
      console.log("CALLBACK: ", { message })
      callback(message)
    }
    return
  } else {
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
