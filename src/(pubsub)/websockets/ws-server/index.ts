import { type Server, sleep, type WebSocketHandler } from "bun"

import {
  type Context,
  type LetsyncConfig,
  LetsyncServer
} from "../../../core/server/config.js"
import { Logger } from "../../../utils/logger.js"
import { WsMessageSchema, type WsMessageType } from "../utils/contract.js"
import { onMessage } from "../utils/ws-rpc-library/on-message.js"
import { RequestStore } from "../utils/ws-rpc-library/request-store.js"
import type {
  $Extract_WsMethodNames,
  WsHandlerType
} from "../utils/ws-rpc-library/type-helpers.js"
import { handlers } from "./handlers/index.js"

type WsData = {
  reqManager: ReturnType<typeof RequestStore>
  userId: string
  deviceId: string
  connectionTime: number
}

export type WsHandler<
  M extends $Extract_WsMethodNames<"client", WsMessageType["type"]>
> = WsHandlerType<WsMessageType, M, Omit<Context, "status" | "fetch">>

export function WebsocketServer(config: LetsyncConfig, name: string) {
  const { context } = LetsyncServer(config)
  const logger = new Logger(`[${name}]`)

  async function dataHandler(
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

  async function ingestHandler(_request: Request) {
    // TODO: Write to DB CDC
    await sleep(1000)
    // TODO: Propagate to all subscribers
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
      onMessage(msg, {
        actor_env: "server",
        context,
        handlers,
        MsgSchema: WsMessageSchema,
        ReqManager: ws.data.reqManager,
        ws
      })
    },
    open(ws) {
      const { userId, deviceId } = ws.data
      const data = { deviceId, userId }
      logger.log("WebSocket opened", data)
      // TODO: Propagate as the user is ONLINE
    }
  }

  return { dataHandler, ingestHandler, wsHandler }
}
