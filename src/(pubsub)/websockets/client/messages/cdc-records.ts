import { type } from "arktype"

import { MessageType } from "../../utils/schema.js"
import type { WsContext } from "../methods/connect.js"

type MsgData = typeof msgData.infer
const msgData = type({
  id: "string",
  kind: "string",
  lsn: "string",
  target_columns: "string[]",
  target_schema: "string",
  target_table: "string",
  target_values: "string[]",
  timestamp: "string",
  user_id: "string"
})

async function handler(record: MsgData, context: WsContext) {
  console.log({ record })

  const database = context.db.get("postgres")
  if (!database) {
    throw new Error("Database not found")
  }
  // @ts-expect-error
  const db = database.client.$client as any

  // TODO: Check if entry is applied.

  await db.query(
    `INSERT INTO "letsync"."cdc_record"
      ("id", "kind", "lsn", "target_columns", "target_schema", "target_table", "target_values", "timestamp", "user_id")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      record.id,
      record.kind,
      record.lsn,
      record.target_columns,
      record.target_schema,
      record.target_table,
      record.target_values,
      record.timestamp,
      record.user_id
    ]
  )
  applyCdcRecord(record)

  function applyCdcRecord(record: MsgData) {
    console.log({ record })
    if (record.kind === "insert") {
      // ...
    }
    // appliedAt
  }
}

export const cdcRecords = {
  handler,
  message: MessageType("'cdc-records'", msgData)
}
