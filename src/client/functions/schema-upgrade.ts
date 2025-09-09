import type { ClientDb } from "@/types/client.js"

import type { Context } from "../config.js"
import { VERSION_KEY } from "../constants.js"

export async function SchemaUpgrade(
  props: ({ name: string } | { db: ClientDb.Adapter<unknown> }) & {
    version: number | { latest: true }
  },
  context: Context
) {
  const db = "name" in props ? context.db.get(props.name) : props.db
  if (!db) {
    throw new Error("Database not found")
  }

  const { version } = props
  const currentVersion = await db.metadata.get(VERSION_KEY)
  const schemas = await db.schema.list({
    aboveVersion: String(currentVersion),
    belowVersion: typeof version === "number" ? String(version) : undefined
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
