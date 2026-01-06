import type { ServerWebSocket } from "bun"

import type { Callback } from "./request-store.js"

type BaseRpcMessage = {
  messageId: null | string
  requestId: string
  type: string
  payload: unknown
}

type WsContextType<RpcMessage extends BaseRpcMessage, Context> = Context & {
  emit: {
    error: (error: string) => void
    event: (event: string, data: unknown) => void
    result: (data?: unknown) => void
    stream: (data?: unknown) => void
  }
  rpc<T extends RpcMessage["type"]>(
    type: T,
    payload?: Extract<RpcMessage, { type: T }>["payload"]
  ): void
}

export function createWsContext<T, Context, RpcMessage extends BaseRpcMessage>({
  ws,
  requestId,
  context
}: {
  ws: ServerWebSocket<T>
  requestId: string
  context: Context
}): WsContextType<RpcMessage, Context> {
  return {
    ...context,
    emit: {
      error: (error: string) => {
        const message = { error, requestId, type: "-- ERROR --" }
        ws.send(JSON.stringify(message))
      },
      event: (event: string, data: unknown) => {
        const message = { data, event }
        ws.send(JSON.stringify(message))
      },
      result: (data = null) => {
        const chunkId = crypto.randomUUID() // TODO: Make an incremental ID
        const message = { chunkId, data, requestId, type: "-- END --" }
        ws.send(JSON.stringify(message))
      },
      stream: (data = null) => {
        const chunkId = crypto.randomUUID() // TODO: Make an incremental ID
        const message = { chunkId, data, requestId, type: "-- STREAM --" }
        ws.send(JSON.stringify(message))
      }
    },
    rpc: (type, data = null) =>
      new Promise((resolve) => {
        const response: unknown[] = []
        const callback: Callback = (props) => {
          const { type, data, requestId } = props
          response.push(data)
          if (type === "-- END --") {
            // @ts-expect-error
            ws.data.reqManager.markAsResolved(requestId)
            const data = response.length === 1 ? response[0] : response
            resolve(data)
          }
        }
        // @ts-expect-error
        const requestId = ws.data.reqManager.add({ callback })
        const message = { chunkId: null, data, requestId, type }
        ws.send(JSON.stringify(message))
      })
  }
}
