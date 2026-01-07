export type WsMsgType = {
  type: string
  requestId: string
  payload: unknown
  messageId: string | null
}

export type $GetSchemaOf_WsMessage<
  type extends string,
  WsMessageType extends WsMsgType
> = Extract<WsMessageType, { type: type }>

export type $Extract_WsMethodNames<
  Actor extends "client" | "server",
  Method extends string
> = Method extends `${Actor}.${infer R}.get` ? R : never

// TODO: Separate "client" and "server" emit types FOR BELOW:

export type WsHandlerType<
  Message extends WsMsgType,
  Method extends $Extract_WsMethodNames<"client", Message["type"]>,
  Context
> = (
  payload: $GetSchemaOf_WsMessage<`client.${Method}.get`, Message>["payload"],
  emit: EmitType<Message, Method>,
  ctx: Context
) => void

export type EmitType<
  Message extends WsMsgType,
  Method extends $Extract_WsMethodNames<"client", Message["type"]>
> = {
  event: <Event extends string>(
    // TODO: Instead of string, use a union of all possible events
    event: Event,
    payload: $GetSchemaOf_WsMessage<
      `client.${Method}.${Event}`,
      Message
    >["payload"]
  ) => void
  result: (
    payload: $GetSchemaOf_WsMessage<
      `server.${Method}.result`,
      Message
    >["payload"]
  ) => void
  stream: (
    payload: $GetSchemaOf_WsMessage<
      `server.${Method}.stream`,
      Message
    >["payload"]
  ) => void
}
