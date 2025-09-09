import { type } from "arktype"

import { MessageType } from "../../utils/schema.js"
import type { WsContext } from "../methods/connect.js"

type MsgData = typeof msgData.infer
const msgData = type({
  name: "string",
  records: type(
    {
      createdAt: "string",
      id: "number",
      operation: "string",
      tenantId: "number",
      updatedAt: "string"
    },
    "[]"
  )
  //   database: [{ cursor: "string", name: "string" }, "[]"],
})

function handler(msg: MsgData, _context: WsContext) {
  const { records: data_ops } = msg

  const dataOpsMap = new Map<number, (typeof data_ops)[number]>()

  for (const dataOp of data_ops) {
    dataOpsMap.set(dataOp.id, dataOp)
  }
}

export const cdcRecords = {
  handler,
  message: MessageType("'cdc-records'", msgData)
}
