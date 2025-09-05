import type { ClientDb, GenericObject } from "@/types/client.js"
import type { SQL_Schemas } from "@/types/schemas.js"

import { generateName } from "../../../utils/generate-name.js"
import { close } from "./close.js"
import { connect } from "./connect.js"
import { dump } from "./dump.js"
import { flush } from "./flush.js"
import { metadata } from "./metadata.js"
import { schema } from "./schema.js"
import { size } from "./size.js"
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
    dump: (_: Parameters<typeof dump>[1]) => dump(client, _),
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
