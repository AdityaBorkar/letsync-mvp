import type { ServerDb } from "@/types/server.js"

import { close } from "./close.js"
import { connect } from "./connect.js"
import { schema } from "./schema.js"
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
    }
  }
  return entity
}
