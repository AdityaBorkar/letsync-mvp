import { type } from "arktype"

import type { SQL_Schemas } from "@/types/schemas.ts"

import { MessageType } from "../../utils/schema.ts"
import type { WsContext } from "../index.ts"

type MsgData = typeof msgData.infer
const msgData = type({
  cursor: "string | null",
  name: "string"
  // strategy: '"ahead-of-time" | "on-demand"',
})

type HandlerProps = MsgData & {
  subscribeChanges: (props: {
    callback: (record: SQL_Schemas.CdcRecord) => void
    userId: string
  }) => void
}

export const handler = async (props: HandlerProps, context: WsContext) => {
  const { userId, cursor, name, subscribeChanges } = props
  const db = (context.db.get(name)?.client as any)?.$client
  if (!db) {
    throw new Error("Database not found")
  }

  // TODO: Enable LOCK

  subscribeChanges({
    callback(record) {
      context.rpc("cdc-records", record)
      // context.rpc("cdc-cache", record)
      // TODO: Collect these records in a LIST
    },
    userId
  })

  const RECORDS_LIMIT = 50
  let $cursor = cursor
  while (true) {
    // biome-ignore lint/performance/noAwaitInLoops: EXCEPTION
    const cdc = await db.sql<SQL_Schemas.CdcRecord>`
          SELECT * FROM "letsync"."cdc"
          WHERE tenantId = ${userId}
          ORDER BY id ASC
          LIMIT ${RECORDS_LIMIT};
        `
    // TODO: GET ALL CACHE FROM
    // context.rpc("cdc-records", data)
    // context.rpc("cdc-cache", data)

    $cursor = cdc.rows.at(-1).id
    if (cdc.rows.length < RECORDS_LIMIT) break
  }

  // TODO: Disable LOCK

  console.log(`Subscribed to changes for user: ${userId}`)

  // TODO: Get Cursor and Integrity & VERIFY
  // Cron Job - Every 24 hours - merge records into the cache file IF records are greater than 50.

  context.end()
}

export const syncRequest = {
  handler,
  message: MessageType("'sync-request'", msgData)
}
