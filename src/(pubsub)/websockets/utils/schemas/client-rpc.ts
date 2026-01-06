import { type } from "arktype"

const MessageType = <const MT extends string, const DT>(
  msg_type: MT,
  payload: type.validate<DT>
) =>
  type.raw({
    messageId: "string",
    payload,
    requestId: "string",
    type: `"server.${msg_type}.get"`
  }) as type.instantiate<{
    messageId: "string"
    payload: DT
    requestId: "string"
    type: `"server.${MT}.get"`
  }>

const pong = MessageType("pong", {})

// import { endMessage, streamMessage } from "../../utils/schema.js"

export const WsMessageSchema = pong
export type WsMessage = typeof WsMessageSchema.infer
// export type PongPayload = (typeof ping.infer)["payload"]
// export type CdcPayload = (typeof cdc.infer)["payload"]
// export type MutationPayload = (typeof mutation.infer)["payload"]

// import { endMessage, streamMessage } from "../schema.js"
// import { cdcCache } from "./handlers/cdc-cache.js"
// import { cdcRecords } from "./handlers/cdc-records.js"

// export const ClientRpcSchema = cdcRecords.message
//   .or(cdcCache.message)
//   .or(streamMessage)
//   .or(endMessage)

// export type ClientRpcMessage = typeof ClientRpcSchema.infer
