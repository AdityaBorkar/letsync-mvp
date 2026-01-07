import { Method } from "./ws-rpc-library/helpers.js"

const ping = Method.server("ping", {
  $input: "null",
  result: {
    server_ts: "number"
  },
  stream: "null"
})

const cdc = Method.server("cdc", {
  $input: {
    cursor: "string | null",
    name: "string"
  },
  result: "null",
  stream: "null"
})

const mutation = Method.server("mutation", {
  $input: {
    cursor: "string",
    name: "string"
  },
  result: "null",
  stream: "null"
})

export const WsMessageSchema = ping.or(cdc).or(mutation)

export type WsMessageType = typeof WsMessageSchema.infer
