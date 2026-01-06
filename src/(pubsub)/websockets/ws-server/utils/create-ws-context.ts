import type { ServerWebSocket } from "bun"

import type { WsMessage } from "../../utils/contract/server-rpc.js"
import type { Callback } from "../../utils/request-store.js"

type WsContextType = {
  emit: {
    event: (event: string, data: unknown) => void
    result: (data?: unknown) => void
    stream: (data?: unknown) => void
  }
  rpc<T extends WsMessage["type"]>(
    type: T,
    payload?: Extract<WsMessage, { type: T }>["payload"]
  ): void
}

export function createWsContext<Context>({
  ws,
  message,
  context
}: {
  ws: ServerWebSocket
  message: WsMessage
  context: Context
}): Context & WsContextType {
  const { requestId, type } = message
  const method = type.split(".")[1]
  return {
    ...context,
    emit: {
      event: (event: string, data: unknown) => {
        const message = { data, event: `${type}.${event}` }
        ws.send(JSON.stringify(message))
      },
      result: (data = null) => {
        const messageId = crypto.randomUUID() // TODO: Make an incremental ID
        const message = { data, messageId, requestId, type: `${method}.result` }
        ws.send(JSON.stringify(message))
      },
      stream: (data = null) => {
        const messageId = crypto.randomUUID() // TODO: Make an incremental ID
        const message = { data, messageId, requestId, type: `${method}.stream` }
        ws.send(JSON.stringify(message))
      }
    },
    // @ts-expect-error
    rpc: (type, data = {}) =>
      new Promise((resolve) => {
        const response: unknown[] = []
        const callback: Callback = (props) => {
          const { type, data, requestId } = props
          response.push(data)
          if (type === `server.${method}.result`) {
            // @ts-expect-error
            ws.data.reqManager.markAsResolved(requestId)
            const data = response.length === 1 ? response[0] : response
            resolve(data)
          }
        }
        // @ts-expect-error
        const requestId = ws.data.reqManager.add({ callback })
        const message = { data, messageId: null, requestId, type }
        ws.send(JSON.stringify(message))
      })
  }
}
