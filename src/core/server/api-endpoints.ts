import { schemaVerify } from "@/core/server/functions/schema-verify.js"

import { schemaLatest } from "./functions/schema-latest.js"
import { schemaMigration } from "./functions/schema-migration.js"

export const API_ENDPOINTS = {
  "/schema/latest": {
    GET: schemaLatest
  },
  "/schema/migration": {
    GET: schemaMigration
  },
  "/schema/verify": {
    POST: schemaVerify
  }
  // "/cdc/records": {
  // 	POST: cdcRecords,
  // },
  // "/cdc/live": {
  // 	GET: changesGet, // getData_POLL(request);
  // 	POST: changesAdd,
  // },
} as const
