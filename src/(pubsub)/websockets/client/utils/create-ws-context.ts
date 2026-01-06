import type {
  ExtractMethodName,
  WsMessage_Schema
} from "../../utils/contract/helpers.js"
import type { WsMessageType } from "../../utils/contract/index.js"
import type { Callback, RequestStore } from "../../utils/request-store.js"

export function createWsContext<Context>({
  message,
  ws,
  context,
  reqManager
}: {
  message: WsMessageType
  ws: WebSocket
  context: Context
  reqManager: ReturnType<typeof RequestStore>
}) {
  const { type, requestId } = message
  const [, method] = type.split(".")
  return {
    ...context,
    emit: {
      event: (event: string, payload: unknown) => {
        const messageId = crypto.randomUUID() // TODO: Make an incremental ID
        const type = `client.${event}.${event}`
        const message = { messageId, payload, requestId, type }
        ws.send(JSON.stringify(message))
      },
      result: (payload = null) => {
        const messageId = crypto.randomUUID() // TODO: Make an incremental ID
        const type = `client.${method}.result`
        const message = { messageId, payload, requestId, type }
        ws.send(JSON.stringify(message))
      },
      stream: (payload = null) => {
        const messageId = crypto.randomUUID() // TODO: Make an incremental ID
        const type = `client.${method}.stream`
        const message = { messageId, payload, requestId, type }
        ws.send(JSON.stringify(message))
      }
    },
    rpc: <T extends ExtractMethodName<"client", WsMessageType["type"]>>(
      method: T,
      payload: WsMessage_Schema<`client.${T}.get`>["payload"]
    ) => {
      type ResultType = WsMessage_Schema<`server.${T}.result`>["payload"] | null

      const response: unknown[] = []

      const result = new Promise<ResultType>((resolve) => {
        const callback: Callback = (props) => {
          const { type, payload, requestId } = props
          response.push(payload)
          if (type === `server.${method}.result`) {
            reqManager.markAsResolved(requestId)
            resolve(payload as ResultType)
          }
        }
        const requestId = reqManager.add({ callback })

        const type = `client.${method}.get`
        const message = { messageId: null, payload, requestId, type }
        ws.send(JSON.stringify(message))
      })

      const on = (event: string, callback: (payload: unknown) => void) => {
        // const callback: Callback = (props) => {
        //   const { type, payload, requestId } = props
        //   response.push(payload)
        //   if (type === `server.${method}.result`) {
        //     reqManager.markAsResolved(requestId)
        //     resolve(payload as ResultType)
        //   }
        // }
      }

      return { on, result }
    }
  }
}

// const ping = rpc.ping.get({})
// const { server_ts } = await ping.result
