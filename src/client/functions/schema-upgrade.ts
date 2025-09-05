import type { Context } from "../config.js"

export async function SchemaUpgrade(
  props: { dbName: string; version: number | { latest: true } },
  context: Context
) {
  const { dbName, version } = props
  const db = context.db.get(dbName)
  if (!db) {
    throw new Error("Database not found")
  }

  const currentVersion = await db.metadata.get(`${db.name}:schema_version`)
  const schemas = await db.schema.list({
    aboveVersion: String(currentVersion),
    belowVersion: String(version)
  })
  if (schemas.length === 0) {
    console.log("No updates found")
    return
  }

  for await (const schema of schemas) {
    await db.schema.migrate({ idx: schema.idx })
  }

  return
}
