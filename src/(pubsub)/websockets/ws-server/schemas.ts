import { mutation } from "./messages/mutation.js"
import { ping } from "./messages/ping.js"
import { syncRequest } from "./messages/sync-request.js"

export const ServerRpcSchema = ping.message
  .or(syncRequest.message)
  .or(mutation.message)

export type ServerRpcMessage = typeof ServerRpcSchema.infer

export type ServerRpcMessageData<T extends ServerRpcMessage["type"]> = Extract<
  ServerRpcMessage,
  { type: T }
>
