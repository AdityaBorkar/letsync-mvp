import type { Server, ServerWebSocket, WebSocketHandler } from "bun"

import type { ServerContext } from "../../../core/server/config.js"
import { onMessage } from "../library-ws-rpc/on-message.js"
import type { RequestStore } from "../library-ws-rpc/request-store.js"
import type {
  $Extract_WsMethodNames,
  WsHandlerType
} from "../library-ws-rpc/type-helpers.js"
import { WsMessageSchema, type WsMessageType } from "../rpc-contract.js"
import { dataHandler } from "./handlers/data.js"
import { ingestHandler } from "./handlers/ingest.js"
import { Context } from "./utils/context.js"
import { logger } from "./utils/logger.js"
import { handlers } from "./ws-handlers/index.js"

type WsData = {
  reqManager: ReturnType<typeof RequestStore>
  userId: string
  deviceId: string
  connectionTime: number
  topics: string[]
  system_callbacks: ((message: string) => void)[]
}

export type HttpServer = Server<WsData>

export type ServerWs = ServerWebSocket<WsData>

type ServerMiddlewareFn = (request: Request) => Promise<void>

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

  function apiHandler(props: {
    request: Request
    server: Server<WsData>
    middleware: Record<string, ServerMiddlewareFn>
  }) {
    const path = props.request.url
    if (path === "/api/letsync/data") {
      return ingestHandler({ ...props })
    } else if (path === "/api/letsync/") {
      return dataHandler(props)
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
      if (msg.toString().startsWith("SYSTEM_CLIENT:")) {
        console.log("Possible Bug: ", { msg })
        return
      }
      if (msg.toString().startsWith("SYSTEM_SERVER:")) {
        console.log("SYSTEM_SERVER: ", { msg })
        const message = JSON.parse(msg.toString().slice(14))
        for (const callback of ws.data.system_callbacks) {
          console.log("SYSTEM_SERVER: ", { message })
          callback(message)
        }
        return
      }
      onMessage(msg, {
        // TODO: Simplify this
        actor_env: "server",
        // @ts-expect-error
        context: { ws },
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

  return { apiHandler, wsHandler }
}
