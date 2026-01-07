import type { WsMessageType } from "../contract.js"
import type { Callback, RequestStore } from "../request-store.js"
import type { ExtractMethodName, WsMessage_Schema } from "./type-helpers.js"

// TODO: Improvements to Make
// 1. Make the types accurate and avoid @ts-expect-error
// 2. Make references to the original code for better understanding
// 3. Error Handling and Logging

export function createWsHandlerContext<Context, Message extends WsMessageType>({
  message,
  ws,
  context,
  reqManager
}: {
  message?: Message
  ws: WebSocket
  context: Context
  reqManager: ReturnType<typeof RequestStore>
}) {
  const { type, requestId } = message ?? {}
  const [, method] = (type || "").split(".")

  type MethodName = ExtractMethodName<"client", WsMessageType["type"]>

  function executeRPC<T extends MethodName>(
    method: T,
    payload: WsMessage_Schema<`client.${T}.get`>["payload"]
  ) {
    // const ping = rpc.ping({})
    type ResultType = WsMessage_Schema<`server.${T}.result`>["payload"]

    const response: unknown[] = []

    const result = new Promise<ResultType>((resolve) => {
      const callback: Callback = (props) => {
        const { type, payload, requestId } = props
        response.push(payload)
        if (type === `server.${method}.result`) {
          reqManager.markAsResolved(requestId)
          // @ts-expect-error
          resolve(payload as ResultType)
        }
      }
      const requestId = reqManager.add({ callback })

      const type = `client.${method}.get`
      const message = { messageId: null, payload, requestId, type }
      ws.send(JSON.stringify(message))
    })

    const on = (event: string, callback: (payload: unknown) => void) => {
      console.log({ callback, event })
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

  const rpc = new Proxy(
    {} as {
      [K in MethodName]: (
        payload: WsMessage_Schema<`client.${K}.get`>["payload"]
      ) => Promise<WsMessage_Schema<`server.${K}.result`>["payload"]>
    },
    {
      get<T extends MethodName>(_: unknown, methodName: T) {
        return (payload: WsMessage_Schema<`client.${T}.get`>["payload"]) =>
          executeRPC(methodName, payload)
      }
    }
  )

  const emit = {
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
  }
  type EmitType = Message extends undefined ? undefined : typeof emit

  return { ...context, emit: emit as EmitType, executeRPC, rpc }
}
