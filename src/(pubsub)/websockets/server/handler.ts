import type { BunRequest, Server, ServerWebSocket } from "bun"

import { ArkErrors } from "arktype"

export type SyncMethod =
  | "sse"
  | "websocket"
  | "webtransport"
  | "http-long-polling"
  | "http-short-polling"

import { mutation } from "../client/messages/mutation.js"
import { ping } from "../client/messages/ping.js"
import { syncRequest } from "../client/messages/syncRequest.js"

export interface WebsocketData {
  userId: string
  connectionTime: number
}
export function getData_WS(request: BunRequest, _: unknown, server: Server) {
  // Upgrade connection to WebSocket with authenticated user data
  const connectionTime = Date.now()
  const upgraded = server.upgrade(request, { data: { connectionTime } })
  if (upgraded) {
    return undefined
  }
  return Response.json(
    { error: "Failed to upgrade to WebSocket" },
    { status: 400 }
  )
}

const MessageType = syncRequest.message.or(mutation.message).or(ping.message)

export const wsHandler = {
  // close(ws: ServerWebSocket<WebsocketData>) {
  // 	const { userId } = ws.data;
  // 	console.log(`WebSocket closed for user: ${userId}`);
  // },

  async message(
    ws: ServerWebSocket<WebsocketData>,
    message: string,
    context: unknown
  ) {
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
  }

  // async open(ws: ServerWebSocket<WebsocketData>) {
  // 	const { userId } = ws.data;
  // },
}
