import type { Server, ServerWebSocket } from "bun"

import { ArkErrors } from "arktype"

import type { SQL_Schemas } from "@/types/schemas.js"

import {
  type Context,
  type LetsyncConfig,
  LetsyncServer
} from "../../../core/server/config.js"
import { Logger } from "../../../utils/logger.js"
import type { ClientRpcMessage } from "../client/schemas.js"
import type { WebsocketData } from "../types.js"
import { createWsContext } from "../utils/create-ws-context.js"
import { RequestStore } from "../utils/request-store.js"
import { ping } from "./messages/ping.js"
import { syncRequest } from "./messages/sync-request.js"
import { type ServerRpcMessage, ServerRpcSchema } from "./schemas.js"

export type Websocket = ServerWebSocket<WebsocketData>

type ContextType = Omit<Context, "status" | "fetch">

export type WsContext = ReturnType<
  typeof createWsContext<WebSocket, ContextType, ClientRpcMessage>
>

export async function WebsocketServer(config: LetsyncConfig<Request>) {
  const { context } = LetsyncServer(config)
  const logger = new Logger(`[${"INSERT-NAME-HERE"}]`)

  const database = context.db.get("postgres")
  if (!database) {
    throw new Error("Database not found")
  }
  const subscribeChanges = await database.syncInitialize("wal")

  const apiHandler = (request: Request, server: Server) => {
    const result = context.auth(request)
    if ("status" in result) {
      return Response.json(result, { status: result.status })
    }

    const { userId, deviceId } = result
    const connectionTime = Date.now()
    const upgraded = server.upgrade(request, {
      data: { connectionTime, deviceId, userId }
    })
    if (!upgraded) {
      return Response.json(
        { error: "Failed to upgrade to WebSocket" },
        { status: 400 }
      )
    }
    return
  }

  const RequestManager = RequestStore()

  const wsHandler = {
    close(ws: Websocket) {
      const { userId } = ws.data
      logger.log(`Connection closed for user: ${userId}`)
    },
    message(ws: Websocket, msg: string) {
      const message = ServerRpcSchema(JSON.parse(msg))
      if (message instanceof ArkErrors) {
        console.log({ message, msg })
        throw new Error("Invalid message format")
      }
      const { type, data, requestId, chunkId } = message
      const wsContext = createWsContext<
        Websocket,
        ContextType,
        ServerRpcMessage
      >({ context, RequestManager, requestId, ws })

      if (chunkId) {
        const request = RequestManager.get(requestId)
        if (!request) {
          logger.error("Request not found", requestId)
        }
        request?.callback(message)
      } else if (type === "ping") {
        ping.handler(data, wsContext)
      } else if (type === "sync-request") {
        const userId = "Unknown"
        syncRequest.handler({ ...data, subscribeChanges, userId }, wsContext)
      }
    },
    open(ws: Websocket) {
      const { userId } = ws.data
      console.log(`WebSocket opened for user: ${userId}`)
    }
  }

  return { apiHandler, wsHandler }
}
