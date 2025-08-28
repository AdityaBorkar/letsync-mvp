import type { SQL_Schemas } from "@/types/schemas.js"

import { sql } from "./sql.js"
import type { DrizzleServerDb } from "./types.js"

export const schema = { list }

async function list(
  db: DrizzleServerDb,
  aboveVersion?: string,
  belowVersion?: string
) {
  const records = await sql<SQL_Schemas.Schema[]>(
    db,
    `SELECT * FROM client_schemas ${aboveVersion ? `WHERE version > ${aboveVersion}` : ""} ${belowVersion ? `AND version < ${belowVersion}` : ""} ORDER BY created_at ${aboveVersion ? "ASC" : "DESC LIMIT 1;"}`
  )
  return records as SQL_Schemas.Schema[]
}
