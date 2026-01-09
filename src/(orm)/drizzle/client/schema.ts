import type { SQL_Schemas } from "@/types/index.js"

import { VERSION_KEY } from "../../../core/client/constants.js"
import { tryCatch } from "../../../utils/try-catch.js"
import type { DrizzleClientDb } from "./index.js"
import { metadata } from "./metadata.js"

export const schema = { initialize, introspect, list, migrate }

async function executeSQL(props: { db: DrizzleClientDb; sql: string }) {
  const { db, sql } = props
  if (!sql.trim()) return
  const { error } = await tryCatch(db.$client.exec(sql))
  if (error) {
    console.log("Schema Execution Failed", error)
    throw error
  }
  return
}

async function initialize(
  db: DrizzleClientDb,
  props: { schema: SQL_Schemas.Schema }
) {
  const { schema } = props
  const { error } = await tryCatch(executeSQL({ db, sql: schema.init_sql }))
  if (error) {
    throw error
  }
  await metadata.set(db, `${VERSION_KEY}:${schema.name}`, String(schema.tag))
  return
}

async function migrate(db: DrizzleClientDb, props: { idx: string }) {
  const { idx } = props
  const result = await db.$client.query<SQL_Schemas.Schema>(
    `SELECT * FROM "letsync"."client_schema" WHERE idx=$1;`,
    [idx]
  )
  const schema = result.rows[0]
  const sql = schema.init_sql.replace("--> statement-breakpoint", "\n\n")
  await executeSQL({ db, sql })
  await metadata.set(db, `__LETSYNC:schema.idx__`, String(idx))
}

async function list(
  db: DrizzleClientDb,
  props?: {
    aboveVersion: string
    belowVersion?: string | undefined
  }
) {
  const { aboveVersion, belowVersion } = props ?? {}
  const query = `
    SELECT * FROM "letsync"."client_schema"
    ${aboveVersion ? ` WHERE idx > ${aboveVersion}` : ""}
    ${belowVersion ? ` AND idx <= ${belowVersion}` : ""}
    ORDER BY idx ASC;
  `
  const schemas = await db.$client.query<SQL_Schemas.Schema>(query)
  return schemas.rows
}

export async function introspect(db: DrizzleClientDb) {
  const schemas = await db.$client.query(`
    SELECT table_name, string_agg(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position) as columns
      FROM information_schema.columns
      WHERE table_schema = 'public'
      GROUP BY table_name
      ORDER BY table_name;
  `)
  return schemas.rows
}
