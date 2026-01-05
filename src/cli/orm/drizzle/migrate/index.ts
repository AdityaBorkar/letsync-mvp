import { join } from "node:path"
import { $, file } from "bun"

import { ArkErrors, type } from "arktype"

// import { Pool } from "pg"

import type { Options, OrmConfig } from "@/cli/orm/config.js"

// import { Pool } from "pg"

// /**
//  * Executes database migration for the Drizzle ORM setup.
//  * Handles schema pushing to server, verification, and client schema recording.
//  */
export async function migrate(config: OrmConfig, options: Options) {
  const { dryRun = false } = options
  if (dryRun) {
    console.log("🔍 Dry run mode is currently WIP. Early Return.")
    return
  }

  // Process server schema
  console.log(`🔄 Migrating schema to server...`)
  const serverConfigPath = join(
    process.cwd(),
    config.output.server.dir,
    "drizzle.config.ts"
  )
  await $`bunx drizzle-kit migrate --config=${serverConfigPath}`

  // Process client schema
  console.log("🔄 Generating client-init schema...")
  const clientConfigPath = join(
    process.cwd(),
    config.output.client.dir,
    "drizzle.config.ts"
  )
  const exportedSQL =
    await $`bunx drizzle-kit export --config=${clientConfigPath}`.text()
  const sqlPath = join(
    process.cwd(),
    config.output.client.dir,
    "init/INIT_TEMPORARY.sql" // TODO: DECIDE A NAME
  )
  await file(sqlPath).write(exportedSQL)

  // console.log(`🔄 Migrating schema to client...`)
  // // @ts-expect-error
  // const journal = await getJournal(config.out)
  // const latest = journal.entries.pop()
  // if (!latest) {
  //   throw new Error("No migration entries found in journal")
  // }
  // const {
  //   // tag, idx, when,
  //   version
  // } = latest
  // if (!SUPPORTED_JOURNAL_VERSION.includes(version)) {
  //   throw new Error(
  //     `Unsupported journal version: ${version}. Only version ${SUPPORTED_JOURNAL_VERSION} is supported.`
  //   )
  // }
  // console.log({ latest })

  // const tag = "INIT_TEMPORARY" // TODO: DECIDE A NAME

  // // @ts-expect-error
  // const basePath = join(process.cwd(), config.output.client.dir)
  // const [sqlInit, sqlMigration] = await Promise.all([
  //   file(join(basePath, `init`, `${tag}.sql`)).text(),
  //   file(join(basePath, `${tag}.sql`)).text()
  // ])
  // const db = new Pool({
  //   // @ts-expect-error
  //   connectionString: config.output.server.dbCredentials.url
  // })
  // const client = await db.connect()
  // const query = `INSERT INTO "letsync"."client_schema"
  //       ("created_at", "id", "init_sql", "schema_ts", "tag", "label")
  //       VALUES ($1, $2, $3, $4, $5, $6)
  //       RETURNING *;`
  // const values = [
  //   new Date(when),
  //   idx,
  //   sqlInit,
  //   sqlMigration,
  //   when,
  //   config.output.client.dialect
  // ]
  // const result = await client.query(query, values)
  // if (result.rows.length === 0) {
  //   throw new Error("Failed to insert client schema record")
  // }
  // client.release()
  // await db.end()

  // TODO: When generating migrations.sql, get the latest schema from timestamp

  console.log("✅ Migration completed successfully")
}

export const SUPPORTED_JOURNAL_VERSION = ["7"]

export async function getJournal(outPath: string) {
  try {
    const path = join(outPath, "meta", "_journal.json")
    const journal = file(path)
    const contents = await journal.json()
    const validated = journalSchema(contents)
    if (validated instanceof ArkErrors) {
      throw new Error(
        `Failed to validate journal file at ${outPath}: ${validated.join("\n")}`
      )
    }
    if (!SUPPORTED_JOURNAL_VERSION.includes(validated.version)) {
      throw new Error(
        `Unsupported journal version: ${validated.version}. Only version ${SUPPORTED_JOURNAL_VERSION} is supported.`
      )
    }
    return validated
  } catch (error) {
    throw new Error(`Failed to read journal file at ${outPath}: ${error}`)
  }
}

const journalSchema = type({
  dialect: "string",
  entries: type(
    {
      breakpoints: "boolean",
      idx: "number",
      tag: "string",
      version: "string",
      when: "number"
    },
    "[]"
  ),
  version: "string"
})
