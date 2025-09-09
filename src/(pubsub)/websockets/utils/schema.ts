import { type } from "arktype"

export const streamMessage = type({
  chunkId: "string",
  data: "unknown",
  requestId: "string",
  type: '"-- STREAM --"'
})

export const endMessage = type({
  chunkId: "string",
  data: "unknown",
  requestId: "string",
  type: '"-- END --"'
})

export const MessageType = <const MT, const DT>(
  msgType: type.validate<MT>,
  data: type.validate<DT>
): type.instantiate<{
  chunkId: "null"
  requestId: "string"
  type: MT
  data: DT
}> =>
  type.raw({
    chunkId: "null",
    data,
    requestId: "string",
    type: msgType
  }) as never
