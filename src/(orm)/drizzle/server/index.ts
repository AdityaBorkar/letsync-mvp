import type { NodePgDatabase } from "drizzle-orm/node-postgres"
import type { Pool } from "pg"

import type { ServerDb } from "@/types/server.js"

import { close } from "./close.js"
import { connect } from "./connect.js"
import { schema } from "./schema.js"
import { syncInitialize } from "./sync-initialize.js"

export type DrizzleServerDb = NodePgDatabase<Record<string, unknown>> & {
  $client: Pool
}

export function ServerDB<T extends DrizzleServerDb>({
  name,
  client
}: {
  name: string
  client: T
}) {
  const entity: ServerDb.Adapter<T> = {
    __brand: "LETSYNC_SERVER_DB",
    client,
    close: () => close(client),
    connect: () => connect(client),
    name,
    schema: {
      list: (params) => schema.list(client, params)
    },
    syncInitialize: (params) => syncInitialize(client, params)
  }
  return entity
}
