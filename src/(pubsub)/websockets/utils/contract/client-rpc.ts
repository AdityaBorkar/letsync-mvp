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
    type: `"server.${MT}"`
  }>

const pingResult = MessageType("ping.result", {
  server_ts: "number"
})

export const WsMessageSchema = pingResult
export type WsMessage = typeof WsMessageSchema.infer
export type PingResultPayload = (typeof pingResult.infer)["payload"]
