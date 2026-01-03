// biome-ignore-all lint/style/useNamingConvention: API Methods must be in uppercase

import type { ServerDb, ServerFs, ServerPubSub } from "@/types/server.ts"

import { schemaList } from "./functions/schema-list.ts"
import { schemaVerify } from "./functions/schema-verify.ts"

export type EndpointContext = {
  db: ServerDb.Adapter<unknown>[]
  fs: ServerFs.Adapter<unknown>[]
  pubsub: ServerPubSub.Adapter
  auth: {
    userId: string
    deviceId: string
  }
}

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
  "/schema": {
    GET: schemaList
  },
  "/schema/verify": {
    POST: schemaVerify
  }
} as const
