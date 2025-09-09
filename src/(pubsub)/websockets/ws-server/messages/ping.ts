import { type } from "arktype"

import { MessageType } from "../../utils/schema.js"
import type { WsContext } from "../index.js"

type MsgData = typeof msgData.infer
const msgData = type("undefined")

export function handler(_msg: MsgData, context: WsContext) {
  const timestamp = Date.now()
  context.end({ timestamp })
}

export const ping = { handler, message: MessageType("'ping'", msgData) }
