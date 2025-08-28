import type { SQL_Schemas } from "@/types/schemas.js"

import type { Context } from "../config.js"

export async function SchemaCheckForUpdates(
  props: { dbName: string },
  context: Context
) {
  const { dbName } = props
  const db = context.db.get(dbName)
  if (!db) {
    throw new Error("Database not found")
  }

  const CurrentVersion = await db.metadata.get(`${db.name}:schema_version`)
  if (!CurrentVersion) {
    throw new Error("No version found")
  }

  const schemas = await context.fetch("GET", "/schema", {
    searchParams: { from: String(CurrentVersion), name: db.name }
  })
  if (schemas.error) {
    throw new Error(schemas.error.toString())
  }
  const _schemas = schemas.data as SQL_Schemas.Schema[]
  await db.schema.insert(_schemas)
}
