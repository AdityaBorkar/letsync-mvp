import type { SQL_Schemas } from "@/types/schemas.ts"

// import { sql } from "./sql.js"
import type { DrizzleServerDb } from "./types.js"

export const schema = { list }

async function list(
  db: DrizzleServerDb,
  params?: {
    aboveVersion: string
    belowVersion?: string
  }
) {
  const { aboveVersion, belowVersion } = params ?? {}
  const query = `
      SELECT * FROM "letsync"."client_schema"
      ${aboveVersion ? `WHERE version > ${aboveVersion}` : ""}
      ${belowVersion ? `AND version < ${belowVersion}` : ""}
      ORDER BY created_at ${aboveVersion ? "ASC" : "DESC"};
    `
  const result = await db.$client.query(query)
  if (result.rows.length === 0) {
    throw new Error("Failed to retrieve client schema record")
  }
  return result.rows as SQL_Schemas.Schema[]
}
