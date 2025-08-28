import { createHash } from "node:crypto"
import { join } from "node:path"
import { $, file } from "bun"

import { Pool } from "pg"

import type { Config } from "./types.js"
import { generateConfig, getJournal } from "./utils.js"

export async function drizzlePush(
  config: Config,
  _options: { dryRun: boolean }
) {
  // const { dryRun = false } = options;

  const configs = await generateConfig(config)
  const clientConfig = configs.get("client")
  const serverConfig = configs.get("server")
  if (!(clientConfig && serverConfig)) {
    throw new Error("No client or server config found!")
  }

  console.log("🔄 Pushing Schema to [SERVER]...")
  await $`bunx drizzle-kit push --config=${config.out}/config.ts`

  console.log("🔄 Verifying Schema for [CLIENT]...")
  // TODO: Check if the database records match the local records.

  console.log("🔄 Pushing Schema to [CLIENT]...")
  const journal = await getJournal(clientConfig.out)
  const migrationCount = journal.migrations.length
  const latestMigration = journal.migrations[migrationCount - 1]
  const latestTag = latestMigration.tag
  const latestSnapshot = String(migrationCount - 1).padStart(4, "0")

  const SnapshotPath = join(clientConfig.out, `/meta/${latestSnapshot}.json`)
  const SqlPath = join(clientConfig.out, latestTag, "sql")
  const snapshot = await file(SnapshotPath).json()
  const migrationSql = await file(SqlPath).text()
  // const newSql = ""; // TODO: Get SQL for first use.
  const checksum = createHash("sha256")
    .update(JSON.stringify(snapshot))
    .digest("hex")

  // @ts-expect-error
  const db = new Pool(config.dbCredentials)

  // TODO: Use drizzle
  await db
    .query(
      `UPDATE "letsync"."__client_schemas" SET checksum=${checksum}, createdAt=${new Date()}, isRolledBack=false, snapshot=${snapshot}, sql=${migrationSql}, tag=${latestTag}, version=${Number(latestTag)} WHERE version=${latestTag} LIMIT 1`
    )
    .then((res) => res.rows[0])
  //   migrations: {
  //     table: 'my-migrations-table', // `__drizzle_migrations` by default
  //     schema: 'public', // used in PostgreSQL only, `drizzle` by default
  //   },

  console.log("✅ Schema push completed")
  return
}
