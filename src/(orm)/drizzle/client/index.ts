import type { ClientDb, GenericObject } from "@/types/client.ts"
import type { SQL_Schemas } from "@/types/schemas.ts"

import { generateName } from "../../../utils/generate-name.ts"
import { close } from "./close.ts"
import { connect } from "./connect.ts"
import { dumpData } from "./dumpData.ts"
import { flush } from "./flush.ts"
import { metadata } from "./metadata.ts"
import { schema } from "./schema.ts"
import { size } from "./size.ts"
import type { DrizzleClientDb_typed } from "./types.js"

export function ClientDB<
  T extends DrizzleClientDb_typed<S>,
  S extends Record<string, unknown>
>(props: { client: T; name?: string }) {
  const { client, name = generateName() } = props
  // TODO: DO NOT ALLOW DIRECT WRITES TO TABLES (IMPLEMENT USING USER ROLES / ACL)
  return {
    __brand: "LETSYNC_CLIENT_DB",
    client,
    close: () => close(client),
    connect: () => connect(client),
    export: (_: Parameters<typeof dumpData>[1]) => dumpData(client, _),
    flush: () => flush(client),
    metadata: {
      get: (key: string) => metadata.get(client, key),
      remove: (key: string) => metadata.remove(client, key),
      set: (key: string, value: string | boolean | GenericObject) =>
        metadata.set(client, key, value)
    },
    name,
    schema: {
      initialize: ($schema: SQL_Schemas.Schema) =>
        schema.initialize(client, { schema: $schema }),
      introspect: () => schema.introspect(client),
      list: (props?: Parameters<(typeof schema)["list"]>[1]) =>
        schema.list(client, props),
      migrate: (props: Parameters<(typeof schema)["migrate"]>[1]) =>
        schema.migrate(client, props)
    },
    size: () => size(client)
  } satisfies ClientDb.Adapter<T>
}
