import type { Callback, RequestStore } from "../../utils/request-store.js"

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

export function createWsContext<Context, RpcMessage extends BaseRpcMessage>({
  ws,
  requestId,
  context,
  reqManager
}: {
  ws: WebSocket
  requestId: string
  context: Context
  reqManager: ReturnType<typeof RequestStore>
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
        const messageId = crypto.randomUUID() // TODO: Make an incremental ID
        const message = { data, messageId, requestId, type: "-- END --" }
        ws.send(JSON.stringify(message))
      },
      stream: (data = null) => {
        const messageId = crypto.randomUUID() // TODO: Make an incremental ID
        const message = { data, messageId, requestId, type: "-- STREAM --" }
        ws.send(JSON.stringify(message))
      }
    },
    rpc: (msg_type, payload = {}) =>
      new Promise((resolve) => {
        const response: unknown[] = []
        const callback: Callback = (props) => {
          const { type, data, requestId } = props
          response.push(data)
          if (type === `server.${msg_type}.result`) {
            reqManager.markAsResolved(requestId)
            const data = response.length === 1 ? response[0] : response
            resolve(data)
          }
        }
        const requestId = reqManager.add({ callback })
        const type = `client.${msg_type}.get`
        const message = { messageId: null, payload, requestId, type }
        ws.send(JSON.stringify(message))
      })
  }
}
