import type { WsMessageType } from "@/(pubsub)/websockets/utils/contract.js"

export type WsMessage_Schema<type extends string> = Extract<
  WsMessageType,
  { type: type }
>

export type ExtractMethodName<
  Actor extends "client" | "server",
  Method extends string
> = Method extends `${Actor}.${infer R}.get` ? R : never
