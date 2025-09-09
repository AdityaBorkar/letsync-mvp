import { type } from "arktype"

import { MessageType } from "../../utils/schema.js"
import type { WsContext } from "../methods/connect.js"

type MsgData = typeof msgData.infer
const msgData = type({
  cache: "string"
  //   database: [{ cursor: "string", name: "string" }, "[]"],
})

function handler(_msg: MsgData, _context: WsContext) {
  // TODO: Handle cdc cache
}

export const cdcCache = {
  handler,
  message: MessageType("'cdc-cache'", msgData)
}
