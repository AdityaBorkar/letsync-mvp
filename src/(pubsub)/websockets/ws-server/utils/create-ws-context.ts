import type { ServerWebSocket } from "bun"

import type { WsMessage_Schema } from "@/(pubsub)/websockets/utils/ws-rpc-library/type-helpers.js"

import type { WsMessageType } from "../../utils/contract.js"
import type { Callback } from "../../utils/request-store.js"

export function createWsContext<Context>({
  ws,
  message,
  context
}: {
  ws: ServerWebSocket
  message: WsMessageType
  context: Context
}) {
  const { requestId, type } = message
  const [, method] = type.split(".")
  return {
    ...context,
    emit: {
      event: (event: string, payload: unknown) => {
        const messageId = crypto.randomUUID() // TODO: Make an incremental ID
        const type = `server.${method}.${event}`
        const message = { messageId, payload, requestId, type }
        ws.send(JSON.stringify(message))
      },
      result: (payload = null) => {
        const messageId = crypto.randomUUID() // TODO: Make an incremental ID
        const type = `server.${method}.result`
        const message = { messageId, payload, requestId, type }
        ws.send(JSON.stringify(message))
      },
      stream: (payload = null) => {
        const messageId = crypto.randomUUID() // TODO: Make an incremental ID
        const type = `server.${method}.stream`
        const message = { messageId, payload, requestId, type }
        ws.send(JSON.stringify(message))
      }
    },
    // @ts-expect-error
    rpc: <T extends ExtractMethodName<"server", WsMessageType["type"]>>(
      method: T,
      payload: WsMessage_Schema<`server.${T}.get`>["payload"]
    ) => {
      type ResultType = WsMessage_Schema<`client.${T}.result`>["payload"] | null
      return new Promise<ResultType>((resolve) => {
        const response: unknown[] = []
        const callback: Callback = (props) => {
          const { type, payload: data, requestId } = props
          response.push(data)
          if (type === `client.${method}.result`) {
            // @ts-expect-error
            ws.data.reqManager.markAsResolved(requestId)
            const data = response.length === 1 ? response[0] : response
            resolve(data as ResultType)
          }
        }
        // @ts-expect-error
        const requestId = ws.data.reqManager.add({ callback })
        const type = `server.${method}.get`
        const message = { messageId: null, payload, requestId, type }
        ws.send(JSON.stringify(message))
      })
    }
  }
}
