import { endMessage, streamMessage } from "../utils/schema.ts"
import { mutation } from "./messages/mutation.ts"
import { ping } from "./messages/ping.ts"
import { syncRequest } from "./messages/sync-request.ts"

export const ServerRpcSchema = ping.message
  .or(syncRequest.message)
  .or(mutation.message)
  .or(streamMessage)
  .or(endMessage)

export type ServerRpcMessage = typeof ServerRpcSchema.infer

export type ServerRpcMessageData<T extends ServerRpcMessage["type"]> = Extract<
  ServerRpcMessage,
  { type: T }
>
