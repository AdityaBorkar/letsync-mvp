import { join } from "node:path"
import { $, file } from "bun"

import { Pool } from "pg"

import type { Config } from "./index.js"
import { generateConfigs } from "./utils/generate-configs.js"
import { getJournal, SUPPORTED_JOURNAL_VERSION } from "./utils/get-journal.js"

interface MigrationOptions {
  dryRun: boolean
}

/**
 * Executes database migration for the Drizzle ORM setup.
 * Handles schema pushing to server, verification, and client schema recording.
 */
export async function migrate(
  config: Config,
  options: MigrationOptions
): Promise<void> {
  const { dryRun = false } = options
  if (dryRun) {
    console.log("🔍 Dry run mode is currently WIP. Early Return.")
    return
  }

  const configs = await generateConfigs(config)

  // Push schema to server
  console.log(`🔄 Pushing schema to server...`)
  await $`bunx drizzle-kit migrate --config=${join(process.cwd(), configs.server.out, "config.ts")}`

  // Process client schema
  await migrateClientSchema(configs.client)

  console.log("✅ Migration completed successfully")
}

/**
 * Processes client schema verification and recording
 */
async function migrateClientSchema(config: Config) {
  console.log(`🔄 Verifying client schema...`)

  const journal = await getJournal(config.out)
  const latest = journal.entries.pop()
  if (!latest) {
    throw new Error("No migration entries found in journal")
  }
  const { tag, idx, when, version } = latest
  if (!SUPPORTED_JOURNAL_VERSION.includes(version)) {
    throw new Error(
      `Unsupported journal version: ${version}. Only version ${SUPPORTED_JOURNAL_VERSION} is supported.`
    )
  }

  const basePath = join(process.cwd(), config.out)
  const [sqlInit, sqlMigration] = await Promise.all([
    file(join(basePath, `init`, `${tag}.sql`)).text(),
    file(join(basePath, `${tag}.sql`)).text()
  ])

  // @ts-expect-error
  const db = new Pool({ connectionString: config.dbCredentials.url })
  const client = await db.connect()

  const query = `
      INSERT INTO "letsync"."client_schemas"
      ("created_at", "idx", "sql_init", "sql_migration", "tag")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `
  const values = [new Date(when), idx, sqlInit, sqlMigration, tag]
  const result = await client.query(query, values)
  if (result.rows.length === 0) {
    throw new Error("Failed to insert client schema record")
  }

  client.release()
  await db.end()
}
