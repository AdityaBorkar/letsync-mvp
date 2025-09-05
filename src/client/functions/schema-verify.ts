import type { Context } from "../config.js"

export async function SchemaVerify(
  props: { dbName: string },
  context: Context
) {
  const { dbName } = props

  const db = context.db.get(dbName)
  if (!db) {
    throw new Error("Database not found")
  }

  const version = await db.metadata.get(`${db.name}:schema_version`)
  const schema = await db.schema.introspect()

  const body = { schema, version }
  const response = await context.fetch("POST", "/schema/verify", { body })
  if (response.error) {
    throw new Error(response.error.toString())
  }
  return response.data
}
