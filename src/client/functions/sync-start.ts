import type { SQL_Schemas } from "@/types/schemas.js"

import type { Context } from "../config.js"
import { DataSync } from "./data-sync.js"
import { SchemaCheckForUpdates } from "./schema-check-for-updates.js"
import { SchemaUpgrade } from "./schema-upgrade.js"

export async function SyncStart(
  props: { autoUpgrade: boolean; checkForUpdates: boolean },
  context: Context
) {
  const { checkForUpdates, autoUpgrade } = props

  for await (const [, db] of context.db.entries()) {
    await db.connect()

    const version = await db.metadata
      .get(`${db.name}:schema_version`)
      .catch((error) => {
        if (
          error.cause
            ?.toString()
            .endsWith('relation "client_metadata" does not exist')
        ) {
          return null
        }
        console.error("Error fetching schema version", error)
        throw error.cause
      })

    if (!version) {
      const response = await context.fetch("GET", "/schema", {
        searchParams: { name: db.name }
      })
      if (response.error) {
        console.error(response.error)
        continue
      }
      const _schema = response.data as SQL_Schemas.Schema
      await db.schema.apply(_schema)
      await db.metadata.set(
        `${db.name}:schema_version`,
        String(_schema.version)
      )
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

  await DataSync(undefined, context)
}
