import { endMessage, streamMessage } from "../utils/schema.js"
import { cdcCache } from "./messages/cdc-cache.js"
import { cdcRecords } from "./messages/cdc-records.js"

export const ClientRpcSchema = cdcRecords.message
  .or(cdcCache.message)
  .or(streamMessage)
  .or(endMessage)

export type ClientRpcMessage = typeof ClientRpcSchema.infer
