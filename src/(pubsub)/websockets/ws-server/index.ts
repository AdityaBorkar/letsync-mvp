import type { Server, WebSocketHandler } from "bun"

import { ArkErrors } from "arktype"

import {
  type Context,
  type LetsyncConfig,
  LetsyncServer
} from "../../../core/server/config.js"
import { Logger } from "../../../utils/logger.js"
import { WsMessageSchema } from "../utils/contract/index.js"
import { RequestStore } from "../utils/request-store.js"
import { handlers } from "./handlers/index.js"
import { createWsContext } from "./utils/create-ws-context.js"

type WsData = {
  reqManager: ReturnType<typeof RequestStore>
  userId: string
  deviceId: string
  connectionTime: number
}

export type WsCtx = ReturnType<
  typeof createWsContext<Omit<Context, "status" | "fetch">>
>

export function WebsocketServer(config: LetsyncConfig<Request>, name: string) {
  const { context } = LetsyncServer(config)
  const logger = new Logger(`[${name}]`)

  async function apiHandler(
    request: Request,
    server: Server<{
      userId: string
      deviceId: string
      connectionTime: number
    }>
  ) {
    const result = await context.auth(request)
    if ("status" in result) {
      const { message, status } = result
      return Response.json({ message }, { status })
    }

    const reqManager = RequestStore()
    const data = { connectionTime: Date.now(), reqManager, ...result }
    const upgraded = server.upgrade(request, { data })
    if (!upgraded) {
      Response.json(
        { error: "Failed to upgrade to WebSocket" },
        { status: 400 }
      )
    }
    return
  }

  // const subscribeChanges = () => {}
  // const database =
  //   context.db.size === 1
  //     ? context.db.values().next().value
  //     : context.db.get(config.shadowDbName || "") // TODO: HARDCODE
  // if (!database) {
  //   throw new Error("Database not found")
  // }
  // const subscribeChanges = await database.syncInitialize("wal")

  const wsHandler: WebSocketHandler<WsData> = {
    close(ws, code, reason) {
      const { userId, deviceId } = ws.data
      const duration = Date.now() - ws.data.connectionTime
      const data = { code, deviceId, duration, reason, userId }
      logger.log("WebSocket closed", data)
    },
    idleTimeout: 60 * 15, // 15 minutes
    message(ws, msg) {
      const msg_string = msg.toString()
      const message = WsMessageSchema(JSON.parse(msg_string))
      if (message instanceof ArkErrors) {
        logger.log("Invalid Message", { error: message.join("\n"), msg_string })
        throw new Error("Invalid Message")
      }

      const { type, payload } = message
      const [actor, method, event] = type.split(".")

      // if (messageId) {
      //   console.log({ messageId })
      //   //   const request = ws.data.reqManager.get(requestId)
      //   //   if (!request) {
      //   //     logger.error("Request not found", requestId)
      //   //     return
      //   //   }
      //   //   request.callback(payload)
      // }
      if (actor === "client") {
        if (event === "get") {
          const handler = handlers[method as keyof typeof handlers]
          if (!handler) {
            logger.error("Invalid message type", type)
            return
          }
          // @ts-expect-error
          const ws_ctx = createWsContext({ context, message, ws })
          // @ts-expect-error
          handler(payload, ws_ctx)
        }
      }
    },
    open(ws) {
      const { userId, deviceId } = ws.data
      const data = { deviceId, userId }
      logger.log("WebSocket opened", data)
      // TODO: Propagate as the user is ONLINE
    }
  }

  return { apiHandler, wsHandler }
}
