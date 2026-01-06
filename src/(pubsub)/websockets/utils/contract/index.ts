import { ServerMethod } from "./helpers.js"

const ping = ServerMethod("ping", {
  input: "null",
  output_result: {
    server_ts: "number"
  },
  output_stream: "null"
})

const cdc = ServerMethod("cdc", {
  input: {
    cursor: "string | null",
    name: "string"
  },
  output_result: "null",
  output_stream: "null"
})

const mutation = ServerMethod("mutation", {
  input: {
    cursor: "string",
    name: "string"
  },
  output_result: "null",
  output_stream: "null"
})

export const WsMessageSchema = ping.or(cdc).or(mutation)

export type WsMessageType = typeof WsMessageSchema.infer
