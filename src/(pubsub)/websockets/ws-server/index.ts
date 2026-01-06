import type { Server, WebSocketHandler } from "bun"

import { ArkErrors } from "arktype"

import { WsMessageSchema } from "@/(pubsub)/websockets/utils/schemas/server-rpc.js"
import { server_contract } from "@/(pubsub)/websockets/ws-server/handlers/index.js"

import {
  type Context,
  type LetsyncConfig,
  LetsyncServer
} from "../../../core/server/config.js"
import { Logger } from "../../../utils/logger.js"
import { createWsContext } from "../utils/create-ws-context.js"
import { RequestStore } from "../utils/request-store.js"
import type { WsMessage } from "../utils/schemas/server-rpc.js"

type WsData = {
  reqManager: ReturnType<typeof RequestStore>
  userId: string
  deviceId: string
  connectionTime: number
}

export type WsCtx = ReturnType<
  typeof createWsContext<WsData, Omit<Context, "status" | "fetch">, WsMessage>
>

export function WebsocketServer(config: LetsyncConfig<Request>) {
  const { context } = LetsyncServer(config)
  const logger = new Logger(`[${"INSERT-NAME-HERE"}]`)

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
      const { userId } = ws.data
      // ws.data.reqManager.flush()
      logger.log(`Connection closed for user: ${userId}`)
      console.log("WebSocket closed", code, reason)
    },
    idleTimeout: 60 * 15, // 15 minutes
    message(ws, msg) {
      // Validation
      const msg_string = msg.toString()
      const message = WsMessageSchema(JSON.parse(msg_string))
      if (message instanceof ArkErrors) {
        logger.log("Invalid Message", { message, msg_string })
        throw new Error("Invalid Message")
      }

      // const ping = rpc.ping.get({})
      // ping.on(<name>, () => {})
      // const result = await ping.result

      // Parsing
      // const userId = ws.data.userId
      const { type, payload, messageId, requestId } = message
      const [, method, event] = type.split(".")

      if (messageId) {
        console.log({ messageId })
        //   const request = RequestManager.get(requestId)
        //   if (!request) {
        //     logger.error("Request not found", requestId)
        //   }
        //   request?.callback(message)
      }
      if (event === "get") {
        const handler = server_contract[method as keyof typeof server_contract]
        if (!handler) {
          logger.error("Invalid message type", type)
          return
        }
        const wsCtx = createWsContext({ context, requestId, ws })
        // @ts-expect-error
        handler(payload, wsCtx)
      }
    },
    open(ws) {
      const { userId } = ws.data
      console.log(`WebSocket opened for user: ${userId}`)
    }
  }

  return { apiHandler, wsHandler }
}
