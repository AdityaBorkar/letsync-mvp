import type { SQL_Schemas } from "@/types/schemas.ts"

import type { Context } from "../config.ts"
import { VERSION_KEY } from "../constants.ts"

export async function SchemaList(
  props: {
    dbName: string
    filterByUpgrade: boolean
  },
  context: Context
) {
  const { dbName, filterByUpgrade } = props

  const data: SQL_Schemas.Schema[] = []

  const db = context.db.get(dbName)
  if (!db) {
    return { data: undefined, error: "No database found." }
  }

  const CurrentVersion = await db.metadata.get(VERSION_KEY)
  if (!CurrentVersion) {
    return { data: undefined, error: "No version found." }
  }

  const list = filterByUpgrade
    ? await db.schema.list({ aboveVersion: String(CurrentVersion) })
    : await db.schema.list()
  data.push(...list)

  return { data, error: undefined }
}
