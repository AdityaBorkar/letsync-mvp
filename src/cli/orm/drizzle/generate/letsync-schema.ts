export const letsync_schema = `
import { boolean, cockroachSchema, jsonb, text, timestamp, uuid } from "drizzle-orm/cockroach-core"
import { v7 as uuidv7 } from "uuid"

export const letsync = cockroachSchema("__letsync__")

export const clientMetadataType = letsync.enum("client_metadata_type", [
  "string",
  "boolean",
  "object"
])

export const clientMetadata = letsync.table("client_metadata", {
  key: text().primaryKey(),
  type: clientMetadataType().notNull(),
  value: text().notNull()
})

export const clientSchemas = letsync.table("client_schema", {
  created_at: timestamp().defaultNow().notNull(),
  id: text()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  init_sql: text().notNull(),
  is_rolled_back: boolean().default(false).notNull(),
  name: text().notNull(),
  schema_js: text().notNull(),
  tag: text()
})

export const mutationStatus = letsync.enum("mutation_status", [
  "pending",
  "processing",
  "completed",
  "failed"
])

export const mutations = letsync.table("mutation", {
  created_at: timestamp().defaultNow().notNull(),
  mutation_name: text().notNull(),
  request_id: uuid().primaryKey(),
  status: mutationStatus().notNull()
})

export const cdcOperationType = letsync.enum("cdc_operation_type", [
  "insert",
  "update",
  "delete"
])

export const cdcRecords = letsync.table("cdc_record", {
  // lsn: text().notNull(), // TODO: Add lsn for ordering of events for PG-WAL
  mvcc_ts: text().primaryKey(),
  table_name: text().notNull(),
  key: text().notNull(),
  type: cdcOperationType().notNull(),
  updated: timestamp().notNull(),
  changes: jsonb().notNull(),
  // tenant_id: uuid(),
})

export const cdcCache = letsync.table("cdc_cache", {
  created_at: timestamp().notNull().defaultNow(),
  mvcc_ts_start: text().primaryKey(),
  mvcc_ts_end: text().notNull(),
  updated_at: timestamp()
    .notNull()
    .$onUpdate(() => new Date()),
  url: text().notNull()
})
`
