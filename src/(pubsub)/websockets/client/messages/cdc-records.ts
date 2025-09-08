import { type } from "arktype"

import type { WebsocketContext } from "../methods/connect.js"

const message = type({
  data: {
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
  },
  refId: "string",
  type: '"cdc-records"'
})

function handler(
  msg: (typeof message.infer)["data"],
  _context: WebsocketContext
) {
  const { records: data_ops } = msg

  const dataOpsMap = new Map<number, (typeof data_ops)[number]>()

  for (const dataOp of data_ops) {
    dataOpsMap.set(dataOp.id, dataOp)
  }
}

export const cdcRecords = { handler, message }
