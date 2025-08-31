import { useContext } from "react"

import { SyncContext } from "../client/context.js"

export function useDatabase<T>({ name }: { name?: string } = {}) {
  const client = useContext(SyncContext)

  if (!name && client.db.size !== 1) {
    throw new Error(
      "Kindly specify a database name or ensure there is only one database configured."
    )
  }
  const clientDb = name ? client.db.get(name) : client.db.values().next().value
  if (!clientDb) {
    throw new Error(`Database "${name}" not found`)
  }

  // TODO: Auto type completion for `clientDb.client`
  // TODO: DATABASE RELATED FEATURES:
  // subscribe()
  // write()
  // read()
  // delete()
  return clientDb.client as T
}
