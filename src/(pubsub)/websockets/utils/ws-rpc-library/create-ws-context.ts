import type { Type } from "arktype"

import type { RequestStore } from "./request-store.js"
import type {
  $Extract_WsMethodNames,
  $GetSchemaOf_WsMessage,
  EmitType,
  WsMsgType
} from "./type-helpers.js"

// TODO: Improvements to Make
// 1. Error Handling and Logging
// 2. Make references to the original code for better understanding

export type LimitedWs = {
  send: (message: string) => void
}

export function createWsHandlerContext<
  Context,
  Ws extends LimitedWs,
  Message extends MessageSchema["infer"],
  MessageSchema extends Type<WsMsgType>
>({
  message,
  ws,
  context,
  ReqManager
}: {
  MsgSchema: MessageSchema
  message?: Message
  ws: Ws
  context: Context
  ReqManager: ReturnType<typeof RequestStore>
}) {
  const { type, requestId } = message ?? {}
  const [, method] = (type || "").split(".")

  type MsgSchema = MessageSchema["infer"]
  type MethodNames = $Extract_WsMethodNames<"client", Message["type"]>

  function executeRPC<T extends MethodNames>(
    method: T,
    payload: $GetSchemaOf_WsMessage<`client.${T}.get`, MsgSchema>["payload"]
  ) {
    const requestId = ReqManager.create()

    const on = (event: string, cbk: (payload: unknown) => void) => {
      ReqManager.update(requestId, (message) => {
        if (message.type === `server.${method}.${event}`) {
          cbk(message.payload)
        }
      })
    }

    type ResultType = $GetSchemaOf_WsMessage<
      `server.${T}.result`,
      MsgSchema
    >["payload"]
    const result = new Promise<ResultType>((resolve) => {
      on("result", (payload) => {
        ReqManager.markAsResolved(requestId)
        // // @ts-expect-error TODO: Implement Error Handling
        resolve(payload as ResultType)
      })
    })

    ws.send(
      JSON.stringify({
        messageId: null,
        payload,
        requestId,
        type: `client.${method}.get`
      })
    )

    return { on, result }
  }

  const rpc = new Proxy(
    {} as {
      [T in MethodNames]: (
        payload: $GetSchemaOf_WsMessage<`client.${T}.get`, MsgSchema>["payload"]
      ) => ReturnType<typeof executeRPC<T>>
    },
    {
      get<T extends MethodNames>(_: unknown, methodName: T) {
        return (
          payload: $GetSchemaOf_WsMessage<
            `client.${T}.get`,
            MsgSchema
          >["payload"]
        ) => executeRPC(methodName, payload)
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

  return {
    ctx: { executeRPC, rpc, ...context },
    emit: emit as Message extends undefined
      ? undefined
      : EmitType<MsgSchema, MethodNames>
  }
}
