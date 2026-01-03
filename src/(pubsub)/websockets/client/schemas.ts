import { endMessage, streamMessage } from "../utils/schema.ts"
import { cdcCache } from "./messages/cdc-cache.ts"
import { cdcRecords } from "./messages/cdc-records.ts"

export const ClientRpcSchema = cdcRecords.message
  .or(cdcCache.message)
  .or(streamMessage)
  .or(endMessage)

export type ClientRpcMessage = typeof ClientRpcSchema.infer
