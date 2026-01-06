// biome-ignore-all lint/style/useNamingConvention: API Methods must be in uppercase

import { schemaLatest } from "./functions/schema-latest.js"
import { schemaMigration } from "./functions/schema-migration.js"

export type { ApiContext } from "./types.js"

export const ApiEndpoints = {
  // "/cache": {
  // 	DELETE: cacheDelete,
  // 	GET: cacheRetrieve,
  // 	POST: cacheUpsert,
  // },
  // "/db/cdc": {
  // 	POST: cdcCapture,
  // },
  // "/db/changes": {
  // 	GET: changesGet, // getData_POLL(request);
  // 	POST: changesAdd,
  // },
  // "/db/changes/status": {
  // 	GET: changesStatus,
  // },
  // "/db/init": {
  // 	GET: databaseInit,
  // },
  // "/device": {
  // 	DELETE: deviceUnregister,
  // 	POST: deviceRegister,
  // },
  // "/schema": {
  //   GET: schemaList
  // },
  // "/schema/verify": {
  //   POST: schemaVerify
  // }
  "/schema/latest": {
    GET: schemaLatest
  },
  "/schema/migration": {
    GET: schemaMigration
  }
} as const
