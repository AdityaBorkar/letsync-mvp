import { createHash } from "node:crypto"
import { join } from "node:path"
import { $, file } from "bun"

import { Pool } from "pg"

import type { Config } from "./types.js"
import { generateConfigs, getJournal } from "./utils.js"

export async function drizzlePush(
  config: Config,
  _options: { dryRun: boolean }
) {
  // const { dryRun = false } = options;
  const outPath = join(process.cwd(), config.out)
  // const srcSchemaPath = join(process.cwd(), config.schema)

  const configs = await generateConfigs(config)
  const client = configs.get("client")
  const server = configs.get("server")
  if (!(client && server)) {
    throw new Error("No client or server config found!")
  }

  console.log("🔄 Pushing Schema to [SERVER]...")
  await $`bunx drizzle-kit migrate --config=${join(outPath, "server")}/config.ts`

  // console.log("🔄 Pushing Schema to [CLIENT]...")
  // await $`bunx drizzle-kit migrate --config=${join(outPath, "client")}/config.ts`

  // TODO: MAKE RELEVANT ENTRIES

  console.log("🔄 Verifying Schema for [CLIENT]...")
  // TODO: Check if the database records match the local records.
  const journal = await getJournal(client.out)
  if (journal.version !== "7") {
    throw new Error("Journal version 7 is only supported version.")
  }
  const entryCount = journal.entries.length
  const latestEntry = journal.entries[entryCount - 1]
  const latestTag = latestEntry.tag
  const latestSnapshot = String(entryCount - 1).padStart(4, "0")

  const SnapshotPath = join(
    process.cwd(),
    client.out,
    `/meta/${latestSnapshot}_snapshot.json`
  )
  const SqlPath = join(client.out, `${latestTag}.sql`)
  const snapshot = await file(SnapshotPath).text()

  const migrationSql = await file(SqlPath).text()
  // const newSql = ""; // TODO: Get SQL for first use.
  const checksum = createHash("sha256").update(snapshot).digest("hex")

  // TODO: Agnostic way to get Database Client
  console.log({ client })
  const db = new Pool({
    // @ts-expect-error
    connectionString: client.dbCredentials.url
  })

  // TODO: [INTEGRITY-CHECK] Auto-verify all existing table entries with the local schema.
  // TODO: Add only if there are "migrations"

  const result = await db
    .query(
      `INSERT INTO "letsync"."client_schemas" ("checksum", "createdAt", "isRolledBack", "snapshot", "sql", "tag", "version") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
      // ON CONFLICT ("tag") DO UPDATE SET "checksum" = EXCLUDED."checksum", "createdAt" = EXCLUDED."createdAt", "isRolledBack" = EXCLUDED."isRolledBack", "snapshot" = EXCLUDED."snapshot", "sql" = EXCLUDED."sql", "version" = EXCLUDED."version"
      [
        checksum,
        new Date(),
        false,
        snapshot,
        migrationSql,
        latestTag,
        entryCount
      ]
    )
    .then((res) => res.rows[0])
    .catch((err) => {
      console.error(err)
      throw err
    })
  console.log({ result })
  //   migrations: {
  //     table: 'my-migrations-table', // `__drizzle_migrations` by default
  //     schema: 'public', // used in PostgreSQL only, `drizzle` by default
  //   },
  // Drizzle: ID, HASH, CREATED_AT

  console.log("✅ Schema push completed")
  return
}
