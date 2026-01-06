import { join } from "node:path"
import { $, file, randomUUIDv7 } from "bun"

import { Pool } from "pg"

import type { Options, OrmConfig } from "@/cli/orm/config.js"

import { getTimestampString } from "../../../../utils/date.js"

/**
 * Executes database migration for the Drizzle ORM setup.
 * Handles schema pushing to server, verification, and client schema recording.
 */
export async function migrate(config: OrmConfig, options: Options) {
  const { dryRun = false } = options
  if (dryRun) {
    console.log("🔍 Dry run mode is currently WIP. Early Return.")
    return
  }

  // Process server schema
  console.log(`\n🔄 Migrating schema to server...`)
  const serverConfigPath = join(config.output.server.dir, "config.js")
  await $`bunx drizzle-kit migrate --config=${serverConfigPath}`
  console.log("\n")

  // Process client schema
  console.log(`\n🔄 Migrating schema to client...`)
  const clientConfigPath = join(config.output.client.dir, "config.js")
  const init_sql =
    await $`bunx drizzle-kit export --config=${clientConfigPath}`.text()

  const schema_js_path = join(config.output.client.dir, "schema", "index.js")
  const schema_js = await file(schema_js_path).text()

  const name = config.output.client.name
  const timestamp = new Date()
  const tag = getTimestampString(timestamp)

  // Connect to Shadow (Server) Database
  const db = new Pool({
    // @ts-expect-error
    connectionString: config.output.server.dbCredentials.url
  })
  const client = await db.connect()

  // Check if the client schema already exists and whether there are any changes.
  const latestV_query = await client.query(
    `SELECT * FROM "letsync"."client_schema" WHERE name = $1 ORDER BY created_at DESC LIMIT 1;`,
    [name]
  )
  const latestV = latestV_query.rows[0]

  if (latestV?.init_sql === init_sql || latestV?.schema_js === schema_js) {
    console.log("No changes found in client schema. Skipping client migration.")
  } else {
    // Write to Shadow Database Table
    const result = await client.query(
      `INSERT INTO "letsync"."client_schema"
            ("created_at", "id", "init_sql", "schema_js", "tag", "name")
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;`,
      [timestamp, randomUUIDv7(), init_sql, schema_js, tag, name]
    )
    if (result.rows.length === 0) {
      throw new Error("Failed to insert client schema record")
    }
    console.log(
      `✅ Client schema record inserted successfully [${name}][${tag}]`
    )
  }

  client.release()
  await db.end()

  console.log("\n✅ Migration completed successfully")
}
