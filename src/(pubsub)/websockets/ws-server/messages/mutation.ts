import { type } from "arktype"

import { MessageType } from "../../utils/schema.ts"
import type { WsContext } from "../index.ts"

type MsgData = typeof msgData.infer
const msgData = type({
  database: {
    cursor: "string",
    name: "string"
  }
})

export function handler(msg: MsgData, context: WsContext) {
  // const {
  //   userId
  //   // tenantId
  // } = context.data

  // TODO: Validate mutation message
  // TODO: RPC execute mutation method
  console.log({ context, msg })

  // TODO: [ack] mutation result
  // TODO: [publish] mutation result
}

export const mutation = { handler, message: MessageType("'mutation'", msgData) }
