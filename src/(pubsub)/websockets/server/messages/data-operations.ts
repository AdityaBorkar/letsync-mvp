import { type } from "arktype"

// data_ops, name, refId, type: 'data_operations'
const message = type({
  data_ops: type(
    {
      createdAt: "string",
      id: "number",
      operation: "string",
      tenantId: "number",
      updatedAt: "string"
    },
    "[]"
  ),
  name: "string",
  refId: "string",
  type: '"data_operations"'
})

function handler(_ws: WebSocket, msg: typeof message.infer) {
  const { data_ops } = msg

  const dataOpsMap = new Map<number, (typeof data_ops)[number]>()

  for (const dataOp of data_ops) {
    dataOpsMap.set(dataOp.id, dataOp)
  }
}

export const dataOperations = { handler, message }
