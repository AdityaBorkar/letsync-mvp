import type { SQL_Schemas } from "@/types/schemas.js"

import { tryCatch } from "../../utils/try-catch.js"
import type { Context } from "../config.js"
import { SCHEMA_VERSION_KEY } from "../constants.js"
import { SchemaCheckForUpdates } from "./schema-check-for-updates.js"
import { SchemaUpgrade } from "./schema-upgrade.js"

export async function SyncStart(
  props: { autoUpgrade: boolean; checkForUpdates: boolean },
  context: Context
) {
  const { checkForUpdates, autoUpgrade } = props

  for await (const [, db] of context.db.entries()) {
    await db.connect()

    const { data: version, error } = await tryCatch(
      db.metadata.get(SCHEMA_VERSION_KEY)
    )
    if (
      error?.cause &&
      !error?.cause
        ?.toString()
        .endsWith('relation "client_metadata" does not exist')
    ) {
      console.error("Error fetching schema version", error.cause)
      throw error.cause
    }

    if (!version) {
      const response = await context.fetch("GET", "/schema", {
        searchParams: { name: db.name }
      })
      if (response.error) {
        console.error(response.error)
        continue
      }
      const schemas = response.data as SQL_Schemas.Schema[]
      console.log("Initializing database", schemas)
      await db.schema.initialize(schemas[0])
      continue
    }

    if (checkForUpdates) {
      await SchemaCheckForUpdates({ dbName: db.name }, context)
    }

    if (autoUpgrade) {
      await SchemaUpgrade(
        { dbName: db.name, version: { latest: true } },
        context
      )
    }
  }

  context.status.isDbRunning.set(true)

  // TODO: REENABLE DATA SYNC
  // await DataSync(undefined, context)
}
