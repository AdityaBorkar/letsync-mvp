import type { HttpServer } from "../index.js"
import { Context } from "../utils/context.js"

export async function ingestHandler(props: {
  request: Request
  server: HttpServer
  ctx: any
}) {
  const { ctx, server } = props

  if ("error" in ctx) {
    throw new Error(ctx.error)
  } else if (!("cdc_records" in ctx) && !ctx.cdc_records) {
    throw new Error("CDC records not found")
  }

  const context = Context.getStore()
  if (!context) {
    throw new Error("Context not found")
  }

  const db = context.db.values().next().value
  if (!db) {
    throw new Error("Database not found")
  }
  await db?.connect()

  // TODO: Figure out how to reject repetitive entries
  // Use idempotent operations to handle duplicates
  // Implement backpressure in streaming to prevent overload
  // Hole Detection (Missing Events)
  // Out-of-Order Delivery

  // TODO: [BATCH ALL REQUESTS IN 1 SECOND]
  for (const cdc of ctx.cdc_records) {
    // TODO: Write to DB CDC
    // const result = await db.cdc.insert(cdc)
    // if (!result) {
    //   throw new Error("Failed to write to database")
    // }

    const message = {
      messageId: null,
      payload: cdc,
      requestId: null,
      type: "server-system.live.stream"
    }
    // props.ctx.ws.send(JSON.stringify(message))
    server.publish(cdc.table_name, JSON.stringify(message)) // TODO: Propagate to all subscribers
  }

  //   ingestCounter += result.cdc_records.length
  //   if (ingestCounter > 100) {
  //     // TODO: CREATE CACHE FOR THE CDC RECORDS
  //     // db.cdc_cache.getLatest()
  //     // db.cdc.get({ from: timestamp, limit: 100 })
  //     // db.cdc_cache.insert()
  //   }

  return { data: {}, status: 200, success: true }

  // TODO: For more deterministic behaviour, make this function a transaction with the Mutation Request, Request fails if this function fails.
}
