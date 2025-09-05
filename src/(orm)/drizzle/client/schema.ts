import type { SQL_Schemas } from "@/types/schemas.js"

import { SCHEMA_VERSION_KEY } from "../../../client/constants.js"
import { tryCatch } from "../../../utils/try-catch.js"
import { flush } from "./flush.js"
import { metadata } from "./metadata.js"
import type { DrizzleClientDb } from "./types.js"

export const schema = { initialize, introspect, list, migrate }

async function executeSQL(props: { db: DrizzleClientDb; sql: string }) {
  const { db, sql } = props
  if (!sql.trim()) return
  try {
    await db.$client.exec(sql)
    return
  } catch (err: unknown) {
    console.log("Schema Execution Failed", err)
    throw String(err)
  }
}

async function initialize(
  db: DrizzleClientDb,
  props: { schema: SQL_Schemas.Schema }
) {
  const { schema } = props
  const { error } = await tryCatch(executeSQL({ db, sql: schema.sql_init }))

  if (error) {
    console.log("Schema Initialization Failed", error)
    if (!String(error).includes("already exists")) {
      throw error
    }
    console.log("Flushing Database")
    await flush(db)
    console.log("Executing Schema Initialization")
    await executeSQL({ db, sql: schema.sql_init })
  }
  await metadata.set(db, SCHEMA_VERSION_KEY, String(schema.idx))
}

async function migrate(db: DrizzleClientDb, props: { idx: string }) {
  const { idx } = props
  const result = await db.$client.query<SQL_Schemas.Schema>(
    `SELECT * FROM "letsync"."client_schemas" WHERE idx=$1;`,
    [idx]
  )
  const schema = result.rows[0]
  const sql = schema.sql_migration.replace("--> statement-breakpoint", "\n\n")
  await executeSQL({ db, sql })
  await metadata.set(db, `__LETSYNC:schema.idx__`, String(idx))
}

async function list(
  db: DrizzleClientDb,
  props?: {
    aboveVersion: string
    belowVersion?: string
  }
) {
  const { aboveVersion, belowVersion } = props ?? {}
  const query = `
    SELECT * FROM "letsync"."client_schemas"
    ${aboveVersion ? ` WHERE idx > ${aboveVersion}` : ""}
    ${belowVersion ? ` AND idx <= ${belowVersion}` : ""}
    ORDER BY idx ASC
  `
  const schemas = await db.$client.query(query)
  if (schemas.rows.length === 0) {
    throw new Error("Failed to retrieve client schema record")
  }
  return schemas.rows as SQL_Schemas.Schema[]
}

export async function introspect(db: DrizzleClientDb) {
  const schemas = await db.$client.query(`
    SELECT table_name, string_agg(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position) as columns
      FROM information_schema.columns
      WHERE table_schema = 'public'
      GROUP BY table_name
      ORDER BY table_name;
  `)
  console.log({ schemas })
  return schemas
}
