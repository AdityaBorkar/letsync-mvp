import { type } from "arktype"

export const Method = {
  client: <
    const Method extends string,
    const Input,
    const Output_Result,
    const Output_Stream
  >(
    method: Method,
    payload: {
      $input: type.validate<Input>
      result: type.validate<Output_Result>
      stream: type.validate<Output_Stream>
    }
  ) =>
    createMethod<"server", Method, Input, Output_Result, Output_Stream>(
      "server",
      method,
      payload
    ),
  // ---
  server: <
    const Method extends string,
    const Input,
    const Output_Result,
    const Output_Stream
  >(
    method: Method,
    payload: {
      $input: type.validate<Input>
      result: type.validate<Output_Result>
      stream: type.validate<Output_Stream>
    }
  ) =>
    createMethod<"client", Method, Input, Output_Result, Output_Stream>(
      "client",
      method,
      payload
    )
}

export function createMethod<
  Actor extends "client" | "server",
  Method extends string,
  const Input,
  const Output_Result,
  const Output_Stream
>(
  actor: Actor,
  method: Method,
  payload: {
    $input: type.validate<Input>
    result: type.validate<Output_Result>
    stream: type.validate<Output_Stream>
  }
) {
  const { $input, result, stream } = payload
  type AnsweringActor = Actor extends "client" ? "server" : "client"
  const answering_actor = (
    actor === "client" ? "server" : "client"
  ) as AnsweringActor

  const common_schema = type.raw({
    messageId: "string | null",
    requestId: "string"
  })
  const input_schema = type.raw({
    payload: $input,
    type: `"${actor}.${method}.get"`
  })
  const output_result_schema = type.raw({
    payload: result,
    type: `"${answering_actor}.${method}.result"`
  })
  const output_stream_schema = type.raw({
    payload: stream,
    type: `"${answering_actor}.${method}.stream"`
  })

  return common_schema.and(
    input_schema.or(output_result_schema).or(output_stream_schema)
  ) as unknown as type.instantiate<
    {
      messageId: "string | null"
      requestId: "string"
    } & (
      | {
          payload: Input
          type: `"${Actor}.${Method}.get"`
        }
      | {
          payload: Output_Result
          type: `"${AnsweringActor}.${Method}.result"`
        }
      | {
          payload: Output_Stream
          type: `"${AnsweringActor}.${Method}.stream"`
        }
    )
  >
}
