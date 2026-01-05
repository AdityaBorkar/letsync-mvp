import {
  boolean,
  cockroachSchema,
  jsonb,
  text,
  timestamp,
  uuid
} from "drizzle-orm/cockroach-core"
import { v7 as uuidv7 } from "uuid"

import type { OrmDialectType } from "@/cli/orm/config.js"

const letsync = cockroachSchema("letsync")

const clientMetadataType = letsync.enum("client_metadata_type", [
  "string",
  "boolean",
  "object"
])

const clientMetadata = letsync.table("client_metadata", {
  key: text().primaryKey(),
  type: clientMetadataType().notNull(),
  value: text().notNull()
})

const clientSchemas = letsync.table("client_schema", {
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

const mutationStatus = letsync.enum("mutation_status", [
  "pending",
  "processing",
  "completed",
  "failed"
])

const mutations = letsync.table("mutation", {
  created_at: timestamp().defaultNow().notNull(),
  mutation_name: text().notNull(),
  request_id: uuid().primaryKey(),
  status: mutationStatus().notNull()
})

const cdcRecords = letsync.table("cdc_record", {
  id: text()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  kind: text({ enum: ["insert", "update", "delete"] }).notNull(),
  lsn: text().notNull(),
  target_columns: jsonb().notNull(),
  target_schema: text().notNull(),
  target_table: text().notNull(),
  target_values: jsonb().notNull(),
  // tenant_id: uuid(),
  timestamp: timestamp().notNull().defaultNow(),
  user_id: uuid().notNull()
})

const cdcCache = letsync.table("cdc_cache", {
  created_at: timestamp().notNull().defaultNow(),
  cursor_end: text().notNull(),
  cursor_start: text().notNull(),
  id: text()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  updated_at: timestamp()
    .notNull()
    .$onUpdate(() => new Date()),
  url: text().notNull()
})

export function schema(dialect: (typeof OrmDialectType)["infer"]) {
  if (dialect !== "cockroach") {
    throw new Error("Unsupported dialect")
  }

  return {
    cdcCache,
    cdcRecords,
    clientMetadata,
    clientMetadataType,
    clientSchemas,
    letsync,
    mutationStatus,
    mutations
  }
}
