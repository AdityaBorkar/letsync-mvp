import type { Server, ServerWebSocket, WebSocketHandler } from "bun"

import type { ServerContext } from "../../../core/server/config.js"
import type { ServerMiddlewareFn } from "../index.js"
import { onMessage } from "../library-ws-rpc/on-message.js"
import type { RequestStore } from "../library-ws-rpc/request-store.js"
import type {
  $Extract_WsMethodNames,
  WsHandlerType,
  WsMsgType
} from "../library-ws-rpc/type-helpers.js"
import { WsMessageSchema, type WsMessageType } from "../rpc-contract.js"
import { dataHandler } from "./handlers/data.js"
import { ingestHandler } from "./handlers/ingest.js"
import { Context } from "./utils/context.js"
import { executeMiddleware } from "./utils/execute-middleware.js"
import { logger } from "./utils/logger.js"
import { handlers } from "./ws-handlers/index.js"

type WsData = {
  reqManager: ReturnType<typeof RequestStore>
  userId: string
  deviceId: string
  connectionTime: number
  topics: string[]
  system_callbacks: ((message: WsMsgType) => void)[]
}

export type HttpServer = Server<WsData>

export type ServerWs = ServerWebSocket<WsData>

export type WsHandler<
  M extends $Extract_WsMethodNames<"client", WsMessageType["type"]>
> = WsHandlerType<WsMessageType, M, ServerContext & { ws: ServerWs }>

export function WsServer(props: {
  config: ServerContext
  debug?: {
    prefix?: string
    color?: string
  }
}) {
  const { config, debug } = props
  Context.enterWith({ ...config, ...(debug || {}) })

  async function apiHandler({
    middleware,
    request,
    server
  }: {
    request: Request
    server: Server<WsData>
    middleware: Record<string, ServerMiddlewareFn[]>
  }) {
    const url = new URL(request.url)
    const path = url.pathname.replace(/\/{2,}/g, "/")
    const method = request.method.toUpperCase()

    if (method === "POST" && path.startsWith("/ingest")) {
      const ctx = await executeMiddleware({ middleware, path, request, server })
      return ingestHandler({ ctx, request, server })
    } else if (method === "GET" && path === "/data") {
      const ctx = await executeMiddleware({ middleware, path, request, server })
      return dataHandler({ ctx, request, server })
    }
    return
  }

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
        // TODO: Simplify this
        actor_env: "server",
        // @ts-expect-error
        context: { ws },
        handlers,
        MsgSchema: WsMessageSchema,
        ReqManager: ws.data.reqManager,
        system_callbacks: ws.data.system_callbacks,
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

  return { apiHandler, wsHandler }
}
