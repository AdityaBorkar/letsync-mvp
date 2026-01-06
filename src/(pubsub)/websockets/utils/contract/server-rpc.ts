import { type } from "arktype"

const MessageType = <const MT extends string, const DT>(
  msg_type: MT,
  payload: type.validate<DT>
) =>
  type.raw({
    messageId: "string | null",
    payload,
    requestId: "string",
    type: `"client.${msg_type}.get"`
  }) as type.instantiate<{
    messageId: "string | null"
    payload: DT
    requestId: "string"
    type: `"client.${MT}.get"`
  }>

const ping = MessageType("ping", {})

const cdc = MessageType("cdc", {
  database: {
    cursor: "string",
    name: "string"
  }
})

const mutation = MessageType("mutation", {
  database: {
    cursor: "string",
    name: "string"
  }
})

// import { endMessage, streamMessage } from "../../utils/schema.js"

export const WsMessageSchema = mutation.or(ping).or(cdc)
export type WsMessage = typeof WsMessageSchema.infer
export type CdcPayload = (typeof cdc.infer)["payload"]
export type PingPayload = (typeof ping.infer)["payload"]
export type MutationPayload = (typeof mutation.infer)["payload"]
