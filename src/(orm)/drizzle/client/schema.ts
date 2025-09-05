import type { SQL_Schemas } from "@/types/schemas.js"

import type { DrizzleClientDb } from "./types.js"

export const schema = { initialize, introspect, list, migrate }

async function executeSQL(db: DrizzleClientDb, sql: string) {
  const commands: string[] = sql.split("--> statement-breakpoint")
  const errors: string[] = []
  for await (const command of commands) {
    try {
      await db.$client.query(command)
    } catch (err: unknown) {
      errors.push(err instanceof Error ? err.toString() : String(err))
    }
  }
  if (errors.length > 0) {
    console.error("Schema Execution Failed", errors)
    throw new Error("Schema Execution Failed")
  }
}

async function initialize(
  db: DrizzleClientDb,
  props: { schema: SQL_Schemas.Schema }
) {
  const { schema } = props
  await executeSQL(db, schema.sql_init)
}

async function migrate(db: DrizzleClientDb, props: { idx: string }) {
  const { idx } = props
  const result = await db.$client.query<SQL_Schemas.Schema>(
    `SELECT * FROM "letsync"."client_schemas" WHERE idx=$1;`,
    [idx]
  )
  const schema = result.rows[0]
  await executeSQL(db, schema.sql_migration)
  console.log({ record: schema })
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
