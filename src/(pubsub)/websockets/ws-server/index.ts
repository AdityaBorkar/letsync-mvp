import type { Server, ServerWebSocket } from "bun"

import { ArkErrors } from "arktype"

import {
  type Context,
  type LetsyncConfig,
  LetsyncServer
} from "../../../server/config.js"
import type {
  ClientRpcMessage,
  ClientRpcMessageData
} from "../client/schemas.js"
import type { WebsocketData } from "../types.js"
import { generateRefId } from "../utils/generate-ref-id.js"
import { ping } from "./messages/ping.js"
import { syncRequest } from "./messages/sync-request.js"
import { ServerRpcSchema } from "./schemas.js"

export type Websocket = ServerWebSocket<WebsocketData>
export type WebsocketContext = Context & {
  end: () => void
  rpc<T extends ClientRpcMessage["type"]>(
    type: T,
    data?: ClientRpcMessageData<T>["data"]
  ): void
}

export function WebsocketServer(config: LetsyncConfig<Request>) {
  const { context } = LetsyncServer(config)

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

  const wsHandler = {
    close(ws: Websocket) {
      const { userId } = ws.data
      console.log(`WebSocket closed for user: ${userId}`)
    },
    message(ws: Websocket, msg: string) {
      const waitForRequestAck = (refId: string) => {
        return new Promise((resolve) => {
          // ws.onmessage = (event) => {
          //   const data = JSON.parse(event.data)
          //   if (data.refId === refId) {
          //     resolve(data)
          //   }
          // }
          console.log("Waiting for request ack", refId)
          resolve(null)
        })
      }
      const wsContext: WebsocketContext = {
        ...context,
        end: () => {
          const refId = generateRefId()
          ws.send(JSON.stringify({ refId, type: "-- END --" }))
        },
        async rpc(type, data) {
          const refId = generateRefId()
          ws.send(JSON.stringify({ data, refId, type }))
          const response = await waitForRequestAck(refId)
          return response
        }
      }

      const message = ServerRpcSchema(JSON.parse(msg))
      if (message instanceof ArkErrors) {
        console.log({ message, msg })
        throw new Error("Invalid message format")
      }

      // TODO: Call Request Store and inform of arrival

      const { type, data } = message
      if (type === "ping") {
        ping.handler(data, wsContext)
      } else if (type === "sync-request") {
        syncRequest.handler(data, wsContext)
      }
    },
    open(ws: Websocket) {
      const { userId } = ws.data
      console.log(`WebSocket opened for user: ${userId}`)
    }
  }

  return { apiHandler, wsHandler }
}
