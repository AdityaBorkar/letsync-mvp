import type { Server, ServerWebSocket } from "bun"

import { ArkErrors } from "arktype"

import { type LetsyncConfig, LetsyncServer } from "../../../server/config.js"
import { mutation } from "../client/messages/mutation.js"
import { ping } from "../client/messages/ping.js"
import { syncRequest } from "../client/messages/syncRequest.js"
import type { WebsocketData } from "../types.js"

const MessageType = syncRequest.message.or(mutation.message).or(ping.message)

export function WebsocketServer(config: LetsyncConfig<Request>) {
  // TODO: Run LetsyncServer() here

  const { context } = LetsyncServer(config)

  const apiHandler = (request: Request, server: Server) => {
    // TODO: Upgrade connection to WebSocket with authenticated user data
    const connectionTime = Date.now()
    const upgraded = server.upgrade(request, { data: { connectionTime } })
    if (!upgraded) {
      return Response.json(
        { error: "Failed to upgrade to WebSocket" },
        { status: 400 }
      )
    }
    return
  }

  const wsHandler = {
    close(ws: ServerWebSocket<WebsocketData>) {
      const { userId } = ws.data
      console.log(`WebSocket closed for user: ${userId}`)
    },
    async message(ws: ServerWebSocket<WebsocketData>, message: string) {
      const data = MessageType(JSON.parse(message))
      if (data instanceof ArkErrors) {
        console.log({ data, message })
        throw new Error("Invalid message format")
      }

      // TODO: Use AsyncLocalStorage for `ws` and `data`
      if (data.type === "ping") {
        await ping.handler(ws, data)
      }
      if (data.type === "mutation") {
        await mutation.handler(ws, data)
      }
      if (data.type === "sync_request") {
        await syncRequest.handler(ws, data, context)
      }
    },
    open(ws: ServerWebSocket<WebsocketData>) {
      const { userId } = ws.data
      console.log(`WebSocket opened for user: ${userId}`)
    }
  }

  return { apiHandler, wsHandler }
}
