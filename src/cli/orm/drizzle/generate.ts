import { cp, exists, mkdir, readFile, rename } from "node:fs/promises"
import { join } from "node:path"
import { $, file, write } from "bun"

import { recursiveCopy } from "@/utils/recursive-copy.ts"

import type { Config } from "./index.ts"
import { generateConfigs } from "./utils/generate-configs.ts"
import { getJournal } from "./utils/get-journal.ts"

/**
 * Generates Drizzle ORM schemas and configurations for both client and server environments
 */
export async function generate(
  config: Config,
  options: { dryRun: boolean } = { dryRun: false }
): Promise<void> {
  const sourceSchemaPath = join(process.cwd(), config.schema)

  if (options.dryRun) {
    console.log("🔄 Dry run mode is currently WIP. Early Return.")
    return
  }

  console.log("🔄 Generating Drizzle configurations...")
  const configs = await generateConfigs(config)

  // Generate schemas in parallel for better performance
  await Promise.all([
    generateSchemaForTarget({
      config: configs.server,
      sourceSchemaPath,
      target: "SERVER"
    }),
    generateSchemaForTarget({
      config: configs.client,
      sourceSchemaPath,
      target: "CLIENT"
    }),
    generateSchemaForClientInit({
      config: configs.client
    })
  ])

  // Rename the temporary init file to the latest tag
  const journal = await getJournal(configs.client.out)
  const latestTag = journal.entries.pop()?.tag
  if (!latestTag) {
    throw new Error("No latest tag found")
  }
  await rename(
    join(configs.client.out, "init", `INIT_TEMPORARY.sql`),
    join(configs.client.out, "init", `${latestTag}.sql`)
  )

  console.log("✅ Schema generation completed successfully")
}

async function generateSchemaForClientInit({ config }: { config: Config }) {
  console.log("🔄 Generating client-init schema...")
  const exportedSQL =
    await $`bunx drizzle-kit export --config=${join(config.out, "config.js")}`.text()
  await write(join(config.out, "init", `INIT_TEMPORARY.sql`), exportedSQL)
}

/**
 * Generates schema for a specific target environment
 */
async function generateSchemaForTarget({
  target,
  config,
  sourceSchemaPath
  // dryRun
}: {
  target: string
  config: Config
  sourceSchemaPath: string
  // dryRun: boolean
}): Promise<void> {
  console.log(`🔄 Generating schema for [${target}]...`)

  const schemaDir = join(config.schema, "../")
  console.log({ schemaDir })
  await mkdir(schemaDir, { recursive: true })
  await recursiveCopy(sourceSchemaPath, schemaDir)

  // Copy letsync schema template
  const schemaType = `drizzle-${config.dialect}`
  const letsyncSchemaTemplate = join(
    import.meta.dir,
    "../../schemas",
    schemaType
  )

  const letsyncSchemaExists = await exists(letsyncSchemaTemplate)
  if (!letsyncSchemaExists) {
    throw new Error(`Schema type '${schemaType}' is not supported`)
  }

  await cp(letsyncSchemaTemplate, join(schemaDir, "letsync.generated.js"))

  // Update index.ts to export letsync schema
  const indexFilePath = join(schemaDir, "index.js")
  const exportStatement = 'export * from "./letsync.generated.js";'

  try {
    const indexFile = file(indexFilePath)
    let content = ""

    if (await indexFile.exists()) {
      content = await readFile(indexFilePath, "utf-8")
    }

    // Check if export already exists (more efficiently than splitting)
    if (content.includes(exportStatement)) {
      return
    }

    // Append export statement with proper formatting
    const updatedContent = content.trim()
      ? `${content}\n\n${exportStatement}\n`
      : `${exportStatement}\n`

    await indexFile.write(updatedContent)
    console.log("✅ Letsync schema export added to index.js")
  } catch (error) {
    console.warn("⚠️  Could not update index.ts:", error)
  }

  console.log(`✅ Schema generation completed for ${config.dialect}`)

  const configPath = join(config.out, "config.js")
  try {
    await $`bun drizzle-kit generate --config=${configPath}`
    console.log("✅ Drizzle migration files generated")
  } catch (error) {
    console.error("❌ Failed to generate drizzle migrations:", error)
    throw error
  }
}
