import { type } from "arktype"

export const streamMessage = type({
  data: "unknown",
  messageId: "string",
  requestId: "string",
  type: '"-- STREAM --"'
})

export const endMessage = type({
  data: "unknown",
  messageId: "string",
  requestId: "string",
  type: '"-- END --"'
})

export const MessageType = <const MT, const DT>(
  msgType: type.validate<MT>,
  data: type.validate<DT>
): type.instantiate<{
  messageId: "null"
  requestId: "string"
  type: MT
  data: DT
}> =>
  type.raw({
    data,
    messageId: "null",
    requestId: "string",
    type: msgType
  }) as never
