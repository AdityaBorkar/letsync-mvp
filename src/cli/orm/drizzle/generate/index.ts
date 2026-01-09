import { join } from "node:path"

import type { Options, OrmConfig } from "../../../orm/config.js"
import { generateConfig } from "./generate-config.js"
import { generateSchema } from "./generate-schema.js"

/**
 * Generates Drizzle ORM schemas and configurations for both client and server environments
 */
export async function generate(
  config: OrmConfig,
  options: Options
): Promise<void> {
  const sourcePath = join(process.cwd(), config.source.schema)

  if (options.dryRun) {
    console.log("🔄 Dry run mode is currently WIP. Early Return.")
    return
  }

  // Generate in parallel for better performance
  await Promise.all([
    generateConfig(config.output.client),
    generateConfig(config.output.server),
    generateSchema({
      source: {
        dialect: config.source.dialect,
        path: sourcePath
      },
      target: {
        dialect: config.output.client.dialect,
        dir: join(config.output.client.dir, "schema")
      }
    }),
    generateSchema({
      source: {
        dialect: config.source.dialect,
        path: sourcePath
      },
      target: {
        dialect: config.output.server.dialect,
        dir: join(config.output.server.dir, "schema")
      }
    })
  ])

  // Rename the temporary init file to the latest tag
  // const journal = await getJournal(configs.client.out)
  // const latestTag = journal.entries.pop()?.tag
  // if (!latestTag) {
  //   throw new Error("No latest tag found")
  // }
  // await rename(
  //   join(configs.client.out, "init", `INIT_TEMPORARY.sql`),
  //   join(configs.client.out, "init", `${latestTag}.sql`)
  // )

  console.log("✅ Schema generation completed successfully")
}
