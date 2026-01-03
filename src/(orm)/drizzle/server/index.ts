import type { ServerDb } from "@/types/index.ts"

import { close } from "./close.ts"
import { connect } from "./connect.ts"
import { schema } from "./schema.ts"
import { syncInitialize } from "./sync-initialize.ts"
import type { DrizzleServerDb } from "./types.js"

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
