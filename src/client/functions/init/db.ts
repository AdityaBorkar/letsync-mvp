import type { Context } from "@/client/config.js"
import type { ClientDb } from "@/types/client.js"
import type { SQL_Schemas } from "@/types/schemas.js"

import { tryCatch } from "../../../utils/try-catch.js"
import { VERSION_KEY } from "../../constants.js"
import { SchemaCheckForUpdates } from "../schema-check-for-updates.js"
import { SchemaUpgrade } from "../schema-upgrade.js"

export async function initDb(props: {
  context: Context
  db: ClientDb.Adapter<unknown>
  checkForUpdates: boolean
  autoUpgrade: boolean
}) {
  const { context, db, checkForUpdates, autoUpgrade } = props
  await db.connect()

  const { data: version, error } = await tryCatch(db.metadata.get(VERSION_KEY))

  if (
    error?.cause &&
    !error?.cause
      ?.toString()
      .endsWith('relation "client_metadata" does not exist')
  ) {
    console.error("Error fetching schema version", error.cause)
    throw error.cause
  }

  console.log(`Schema Version for ${db.name}:`, version)

  if (version === null) {
    const response = await context.fetch("GET", "/schema", {
      searchParams: { name: db.name }
    })
    if (response.error) {
      console.error(`Schema fetch error for ${db.name}:`, response.error)
      return
    }
    const schemas = response.data as SQL_Schemas.Schema[]
    console.log(`Initializing database ${db.name}`, schemas)
    await db.schema.initialize(schemas[0])
    console.log("Database Initialized", db.name)
    return
  }

  // Run schema operations sequentially per database
  if (checkForUpdates) {
    await SchemaCheckForUpdates({ dbName: db.name }, context)
  }

  if (autoUpgrade) {
    await SchemaUpgrade({ dbName: db.name, version: { latest: true } }, context)
  }
}
