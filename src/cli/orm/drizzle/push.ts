import { createHash } from "node:crypto"
import { join } from "node:path"
import { $, file } from "bun"

import { Pool } from "pg"

import type { Config } from "./types.js"
import { generateConfigs, getJournal } from "./utils.js"

// import { drizzle } from "drizzle-orm/node-postgres"
// import { migrate } from "drizzle-orm/node-postgres/migrator"

export async function drizzlePush(
  config: Config,
  _options: { dryRun: boolean }
) {
  // const { dryRun = false } = options;

  const configs = await generateConfigs(config)
  const clientConfig = configs.get("client")
  const serverConfig = configs.get("server")
  if (!(clientConfig && serverConfig)) {
    throw new Error("No client or server config found!")
  }

  console.log("🔄 Pushing Schema to [SERVER]...")
  await $`bunx drizzle-kit push --config=${serverConfig.out}/config.ts`

  console.log("🔄 Pushing Schema to [CLIENT]...")
  await $`bunx drizzle-kit push --config=${clientConfig.out}/config.ts`

  console.log("🔄 Verifying Schema for [CLIENT]...")
  // TODO: Check if the database records match the local records.
  const journal = await getJournal(clientConfig.out)
  if (journal.version !== "7") {
    throw new Error("Journal version 7 is only supported version.")
  }
  const entryCount = journal.entries.length
  const latestEntry = journal.entries[entryCount - 1]
  const latestTag = latestEntry.tag
  const latestSnapshot = String(entryCount - 1).padStart(4, "0")

  const SnapshotPath = join(
    clientConfig.out,
    `/meta/${latestSnapshot}_snapshot.json`
  )
  const SqlPath = join(clientConfig.out, `${latestTag}.sql`)
  const snapshot = await file(SnapshotPath).text()

  const migrationSql = await file(SqlPath).text()
  // const newSql = ""; // TODO: Get SQL for first use.
  const checksum = createHash("sha256").update(snapshot).digest("hex")

  // TODO: Agnostic way to get Database Client
  const db = new Pool({
    // @ts-expect-error
    connectionString: clientConfig.dbCredentials.url
  })

  // Build a safe, parameterized UPDATE (removes invalid LIMIT and avoids injections)
  await db
    .query(
      `UPDATE "letsync"."client_schemas" SET "checksum" = $1, "createdAt" = $2, "isRolledBack" = $3, "snapshot" = $4, "sql" = $5, "tag" = $6, "version" = $7 WHERE "tag" = $6 RETURNING *;`,
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
  //   migrations: {
  //     table: 'my-migrations-table', // `__drizzle_migrations` by default
  //     schema: 'public', // used in PostgreSQL only, `drizzle` by default
  //   },

  console.log("✅ Schema push completed")
  return
}
