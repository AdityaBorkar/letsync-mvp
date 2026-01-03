import type { Callback, RequestStore } from "./request-store.ts"

type BaseRpcMessage = {
  type: string
  chunkId: null | string
  requestId: string
  data: unknown
}

type WsContextType<RpcMessage extends BaseRpcMessage, Context> = Context & {
  end: (data?: unknown) => void
  stream: (data?: unknown) => void
  rpc<T extends RpcMessage["type"]>(
    type: T,
    data?: Extract<RpcMessage, { type: T }>["data"]
  ): void
}

export function createWsContext<
  WsType,
  Context,
  RpcMessage extends BaseRpcMessage
>({
  RequestManager,
  ws,
  requestId,
  context
}: {
  RequestManager: ReturnType<typeof RequestStore>
  ws: WsType
  requestId: string
  context: Context
}): WsContextType<RpcMessage, Context> {
  return {
    ...context,
    end: (data = null) => {
      const chunkId = crypto.randomUUID() // TODO: Make an incremental ID
      const message = { chunkId, data, requestId, type: "-- END --" }
      // @ts-expect-error
      ws.send(JSON.stringify(message))
    },
    rpc: (type, data = null) =>
      new Promise((resolve) => {
        const response: unknown[] = []
        const callback: Callback = (props) => {
          const { type, data, requestId } = props
          response.push(data)
          if (type === "-- END --") {
            RequestManager.markAsResolved(requestId)
            const data = response.length === 1 ? response[0] : response
            resolve(data)
          }
        }
        const requestId = RequestManager.add({ callback })

        const message = { chunkId: null, data, requestId, type }
        // @ts-expect-error
        ws.send(JSON.stringify(message))
      }),
    stream: (data = null) => {
      const chunkId = crypto.randomUUID() // TODO: Make an incremental ID
      const message = { chunkId, data, requestId, type: "-- STREAM --" }
      // @ts-expect-error
      ws.send(JSON.stringify(message))
    }
  }
}
