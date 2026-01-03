import { endMessage, streamMessage } from "../utils/schema.js"
import { mutation } from "./messages/mutation.js"
import { ping } from "./messages/ping.js"
import { syncRequest } from "./messages/sync-request.js"

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
