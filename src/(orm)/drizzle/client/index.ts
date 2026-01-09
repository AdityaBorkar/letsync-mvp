import type { PGlite } from "@electric-sql/pglite"
import type { PgliteDatabase } from "drizzle-orm/pglite"

import type { ClientDb } from "@/types/client.js"

import { close } from "./functions/close.js"
import { connect } from "./functions/connect.js"
import { dumpData } from "./functions/dump-data.js"
import { flush } from "./functions/flush.js"
import { metadata } from "./functions/metadata.js"
import { schema } from "./functions/schema.js"
import { size } from "./functions/size.js"

type pglite<S extends Record<string, unknown>> = PgliteDatabase<S> & {
  $client: PGlite
}

export type DrizzleClientDb = pglite<Record<string, unknown>>

export type DrizzleClientDb_typed<S extends Record<string, unknown>> = pglite<S>

export function ClientDB<
  T extends DrizzleClientDb_typed<S>,
  S extends Record<string, unknown>
>(props: { client: T; name: string }) {
  const { client, name } = props
  // TODO: DO NOT ALLOW DIRECT WRITES TO TABLES (IMPLEMENT USING USER ROLES / ACL)
  const entity: ClientDb.Adapter<T> = {
    __brand: "LETSYNC_CLIENT_DB",
    client,
    close: () => close(client),
    connect: () => connect(client),
    export: (_: Parameters<typeof dumpData>[1]) => dumpData(client, _),
    flush: () => flush(client),
    metadata: {
      get: (key) => metadata.get(client, key),
      remove: (key) => metadata.remove(client, key),
      set: (key, value) => metadata.set(client, key, value)
    },
    name,
    schema: {
      initialize: ($schema) => schema.initialize(client, { schema: $schema }),
      introspect: () => schema.introspect(client),
      list: (props) => schema.list(client, props),
      migrate: (props) => schema.migrate(client, props)
    },
    size: () => size(client)
  }
  return entity
}
