import { join } from "node:path"
import { write } from "bun"

import type { DrizzleServerDb } from "./types.js"

export async function syncInitialize(client: DrizzleServerDb, params: "wal") {
  const { $client } = client

  if (params !== "wal") {
    throw new Error("Only WAL is supported for now!")
  }

  // Enable logical replication
  await $client.query(`
    ALTER SYSTEM SET wal_level = logical;
    ALTER SYSTEM SET max_replication_slots = 10;
    ALTER SYSTEM SET max_wal_senders = 10;
  `)
  await $client.query("SELECT pg_reload_conf()")

  // Create publication for all tables
  await $client.query("CREATE PUBLICATION sync_pub FOR ALL TABLES")

  // Create replication slot with wal2json
  await $client.query(`
    SELECT pg_create_logical_replication_slot('letsync_slot', 'wal2json')
  `)

  // Start logical replication stream
  await $client.query("START_REPLICATION SLOT letsync_slot LOGICAL 0/0")

  // @ts-expect-error - copyData is not typed
  $client.on("copyData", (chunk: any) => {
    const message = chunk.toString("utf8")
    const changes = JSON.parse(message)
    const timestamp = new Date()
    console.log({ changes })
    write(
      join(process.cwd(), `changes-${timestamp.valueOf()}.json`),
      JSON.stringify({ changes, timestamp: timestamp.toISOString() }, null, 2)
    )

    for (const change of changes.change || []) {
      console.log({ change })
      //   const { kind, schema, table, columnnames, columnvalues, oldkeys } = change

      //   // Skip letsync schema changes to avoid recursion
      //   if (schema === "letsync") return

      //   const cdcRecord = {
      //     action: kind, // 'insert', 'update', 'delete'
      //     transformations: {
      //       columnnames,
      //       columnvalues,
      //       oldkeys,
      //       schema,
      //       table
      //     },
      //     user_id: this.extractUserId(change) // Extract from row data
      //   }

      //   // Store in CDC table
      //   await this.storeCDCRecord(cdcRecord)

      //   // Publish to relevant websocket connections
      //   await this.publishToClients(cdcRecord)
    }
  })

  return {}
}

// import type { Client } from "pg"
// import type { WsContext } from "../index.js"

// export class WALProcessor {
//   private pg: Client
//   private wsConnections = new Map<string, WsContext>()
//   private isRunning = false

//   constructor(pg: Client) {
//     this.pg = pg
//   }

//   addConnection(userId: string, wsContext: WsContext) {
//     this.wsConnections.set(userId, wsContext)
//   }

//   removeConnection(userId: string) {
//     this.wsConnections.delete(userId)
//   }

//   private async storeCDCRecord(record: any) {
//     await this.pg.query(
//       `
//       INSERT INTO letsync.cdc_record (id, action, timestamp, user_id, transformations)
//       VALUES ($1, $2, $3, $4, $5)
//     `,
//       [
//         record.id,
//         record.action,
//         record.timestamp,
//         record.user_id,
//         JSON.stringify(record.transformations)
//       ]
//     )
//   }

//   private async publishToClients(record: any) {
//     const userId = record.user_id
//     const wsContext = this.wsConnections.get(userId)

//     if (wsContext) {
//       wsContext.stream({
//         type: "cdc-records",
//         data: {
//           name: "default", // or extract from schema/table
//           records: [
//             {
//               id: record.id,
//               operation: record.action,
//               tenantId: userId,
//               createdAt: record.timestamp.toISOString(),
//               updatedAt: record.timestamp.toISOString()
//             }
//           ]
//         }
//       })
//     }
//   }

//   private extractUserId(change: any): string {
//     // Extract user_id from the changed row data
//     const userIdIndex = change.columnnames?.indexOf("user_id")
//     return userIdIndex >= 0 ? change.columnvalues[userIdIndex] : "unknown"
//   }
// }
