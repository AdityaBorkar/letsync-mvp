import type { HttpServer } from "../index.js"
import { Context } from "../utils/context.js"

export async function ingestHandler(props: {
  request: Request
  server: HttpServer
}) {
  const context = Context.getStore()
  if (!context) {
    console.error("Context not found")
    return Response.json({ message: "Internal Server Error" }, { status: 500 })
  }

  const db = context.db.values().next().value
  // context.db.size === 1
  //   ? context.db.values().next().value
  //   : context.db.get(context.shadowDbName || "") // TODO: HARDCODE
  if (!db) {
    throw new Error("Database not found")
  }
  await db?.connect()

  //   ----

  const { request, server } = props
  const body = await request.text()
  // @ts-expect-error REPLACE WITH MIDDLWARE LOGIC
  const result = await context.ingest(body)
  if (!result.success) {
    return Response.json({ error: result.error }, { status: 500 })
  }

  // TODO: Figure out how to reject repetitive entries
  // Use idempotent operations to handle duplicates
  // Implement backpressure in streaming to prevent overload
  // Hole Detection (Missing Events)
  // Out-of-Order Delivery

  // TODO: [BATCH ALL REQUESTS IN 1 SECOND]
  console.log({ result })
  for (const cdc of result.cdc_records) {
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
    console.log({ message })
    server.publish(cdc.table_name, `SYSTEM_SERVER:${JSON.stringify(message)}`) // TODO: Propagate to all subscribers
  }

  //   ingestCounter += result.cdc_records.length
  //   if (ingestCounter > 100) {
  //     // TODO: CREATE CACHE FOR THE CDC RECORDS
  //     // db.cdc_cache.getLatest()
  //     // db.cdc.get({ from: timestamp, limit: 100 })
  //     // db.cdc_cache.insert()
  //   }

  return Response.json({ success: true })
  // TODO: For more deterministic behaviour, make this function a transaction with the Mutation Request, Request fails if this function fails.
}
