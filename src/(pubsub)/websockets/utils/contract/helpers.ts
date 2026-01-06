import { type } from "arktype"

import type { WsMessageType } from "@/(pubsub)/websockets/utils/contract/index.js"

export function ServerMethod<
  const Method extends string,
  const Input,
  const Output_Result,
  const Output_Stream
>(
  method: Method,
  payload: {
    input: type.validate<Input>
    output_result: type.validate<Output_Result>
    output_stream: type.validate<Output_Stream>
  }
) {
  const { input, output_result, output_stream } = payload

  const common_schema = type.raw({
    messageId: "string",
    requestId: "string"
  })
  const input_schema = type.raw({
    payload: input,
    type: `"client.${method}.get"`
  })
  const output_result_schema = type.raw({
    payload: output_result,
    type: `"server.${method}.result"`
  })
  const output_stream_schema = type.raw({
    payload: output_stream,
    type: `"server.${method}.stream"`
  })

  return common_schema.and(
    input_schema.or(output_result_schema).or(output_stream_schema)
  ) as unknown as type.instantiate<
    {
      messageId: "string"
      requestId: "string"
    } & (
      | {
          payload: Input
          type: `"client.${Method}.get"`
        }
      | {
          payload: Output_Result
          type: `"server.${Method}.result"`
        }
      | {
          payload: Output_Stream
          type: `"server.${Method}.stream"`
        }
    )
  >
}

export type WsMessage_Schema<type extends string> = Extract<
  WsMessageType,
  { type: type }
>

export type ExtractMethodName<
  Actor extends "client" | "server",
  Method extends string
> = Method extends `${Actor}.${infer R}.get` ? R : never
