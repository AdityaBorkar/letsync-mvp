import { type } from "arktype"

import { cdcCache } from "./messages/cdc-cache.js"
import { cdcRecords } from "./messages/cdc-records.js"
import { pong } from "./messages/pong.js"

const streamMessage = type({
  data: "unknown",
  refId: "string",
  type: '"-- STREAM --"'
})

const endMessage = type({
  data: "null",
  refId: "string",
  type: '"-- END --"'
})

export const ClientRpcSchema = pong.message
  .or(cdcRecords.message)
  .or(cdcCache.message)
  .or(streamMessage)
  .or(endMessage)

export type ClientRpcMessage = typeof ClientRpcSchema.infer

export type ClientRpcMessageData<T extends ClientRpcMessage["type"]> = Extract<
  ClientRpcMessage,
  { type: T }
>
