// import {
//   LogicalReplicationService,
//   type Wal2Json,
//   Wal2JsonPlugin
// } from "pg-logical-replication"
// import { v7 as uuidv7 } from "uuid"

// import type { SQL_Schemas } from "@/types/schemas.js"

import { connect } from "./connect.js"
import type { DrizzleServerDb } from "./types.js"

export async function syncInitialize(client: DrizzleServerDb, params: "wal") {
  await connect(client)

  if (params) {
  }

  // const { $client } = client
  // if (params !== "wal") {
  //   throw new Error("Only WAL is supported for now!")
  // }

  // const wal = await $client.query(`SHOW wal_level;`)
  // if (wal.rows[0].wal_level !== "logical") {
  //   console.log({ wal: wal.rows[0].wal_level })
  //   await $client.query(`ALTER SYSTEM SET wal_level = logical;`)
  //   await $client.query(`ALTER SYSTEM SET wal_log_hints = on;`)
  //   await $client.query(`ALTER SYSTEM SET max_wal_senders = 10;`)
  //   await $client.query(`ALTER SYSTEM SET max_replication_slots = 10;`)
  //   await $client.query(`ALTER SYSTEM SET log_min_messages = debug1;`)
  //   await $client.query(`ALTER SYSTEM SET log_replication_commands = on;`)
  //   await $client.query(`ALTER SYSTEM SET wal_sender_timeout = 600000;`)
  //   await $client.query("SELECT pg_reload_conf();")
  // }

  // const SLOT_NAME = "letsync"
  // const slots = await $client.query(
  //   `SELECT * FROM pg_replication_slots WHERE slot_name = '${SLOT_NAME}';`
  // )
  // if (slots.rows.length === 0) {
  //   await $client.query(
  //     `SELECT pg_create_logical_replication_slot('${SLOT_NAME}', 'wal2json')`
  //   )
  // }

  // const subscribers = new Map<string, (record: SQL_Schemas.CdcRecord) => void>()

  // const plugin = new Wal2JsonPlugin()
  // const service = new LogicalReplicationService(client.$client.options, {
  //   acknowledge: { auto: true, timeoutSeconds: 10 }
  // })
  // service.on("start", () => {
  //   console.log("CDC Capture Service Started")
  // })
  // service.on("data", (_lsn: string, log: Wal2Json.Output) => {
  //   for (const change of log.change) {
  //     const { kind, schema, table, columnnames, columnvalues } = change
  //     if (kind === "message" || kind === "truncate") {
  //       continue
  //     }
  //     if (schema === "letsync") {
  //       if (table === "cdc_record" || table === "cdc_cache") continue
  //     }

  //     const id = uuidv7()
  //     const user_id = "Unknown"
  //     const timestamp = new Date().toISOString()
  //     $client.query(
  //       `INSERT INTO "letsync"."cdc_record"
  //           ("id", "kind", "target_schema", "target_table", "target_columns", "target_values", "user_id", "timestamp")
  //       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
  //       [id, kind, schema, table, columnnames, columnvalues, user_id, timestamp]
  //     )

  //     const notify = subscribers.get(user_id)
  //     notify?.({
  //       id,
  //       kind,
  //       target_columns: columnnames,
  //       target_schema: schema,
  //       target_table: table,
  //       target_values: columnvalues,
  //       timestamp,
  //       user_id
  //     })
  //   }
  // })

  // const subscribeFn = () => {
  //   service
  //     .subscribe(plugin, SLOT_NAME)
  //     .catch((e) => {
  //       console.error(e)
  //     })
  //     .then(() => {
  //       setTimeout(subscribeFn, 100)
  //     })
  // }
  // subscribeFn()

  // const subscribeForUser = (userId: string, ws: WebSocket) => {
  //   subscribers.set(userId, (record) => {
  //     // ...
  //     ws.send(JSON.stringify({ data: record, type: "cdc-record" }))
  //   })
  // }

  return {}
}
