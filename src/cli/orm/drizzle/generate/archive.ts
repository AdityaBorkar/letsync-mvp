// import { join } from "node:path"
// import { file } from "bun"

// import { ArkErrors, type } from "arktype"

// export const SUPPORTED_JOURNAL_VERSION = ["7"]

// export async function getJournal(outPath: string) {
//   try {
//     const path = join(outPath, "meta", "_journal.json")
//     const journal = file(path)
//     const contents = await journal.json()
//     const validated = journalSchema(contents)
//     if (validated instanceof ArkErrors) {
//       throw new Error(
//         `Failed to validate journal file at ${outPath}: ${validated.join("\n")}`
//       )
//     }
//     if (!SUPPORTED_JOURNAL_VERSION.includes(validated.version)) {
//       throw new Error(
//         `Unsupported journal version: ${validated.version}. Only version ${SUPPORTED_JOURNAL_VERSION} is supported.`
//       )
//     }
//     return validated
//   } catch (error) {
//     throw new Error(`Failed to read journal file at ${outPath}: ${error}`)
//   }
// }

// const journalSchema = type({
//   dialect: "string",
//   entries: type(
//     {
//       breakpoints: "boolean",
//       idx: "number",
//       tag: "string",
//       version: "string",
//       when: "number"
//     },
//     "[]"
//   ),
//   version: "string"
// })

// async function generateSchemaForClientInit({ config }: { config: OrmConfig }) {
//   console.log("🔄 Generating client-init schema...")
//   const exportedSQL =
//     await $`bunx drizzle-kit export --config=${join(config.out, "config.js")}`.text()
//   await write(join(config.out, "init", `INIT_TEMPORARY.sql`), exportedSQL)
// }

// /**
//  * Generates schema for a specific target environment
//  */
// async function generateSchemaForTarget({
//   targetDir,
//   dialect,
//   schemaPath
// }: {
//   targetDir: string
//   dialect:
//   schemaPath: string
// }): Promise<void> {

//   // ! WORKAROUND - RIGHT NOW, IT COPIES ALL THE FILES IN THE DIRECTORY RATHER THAN CHECKING THE IMPORTS.
//   const schemaDir = join(config.source.schema, "../")
//   await mkdir(schemaDir, { recursive: true })
//   await recursiveCopy(sourceSchemaPath, schemaDir)

//   // Copy letsync schema template
//   const schemaType = `drizzle-${config.dialect}`
//   const letsyncSchemaTemplate = join(
//     import.meta.dir,
//     "../../schemas",
//     schemaType
//   )

//   const letsyncSchemaExists = await exists(letsyncSchemaTemplate)
//   if (!letsyncSchemaExists) {
//     throw new Error(`Schema type '${schemaType}' is not supported`)
//   }

//   await cp(letsyncSchemaTemplate, join(schemaDir, "letsync.generated.js"))

//   // Update index.ts to export letsync schema
//   const indexFilePath = join(schemaDir, "index.js")
//   const exportStatement = 'export * from "./letsync.generated.js";'

//   try {
//     const indexFile = file(indexFilePath)
//     let content = ""

//     if (await indexFile.exists()) {
//       content = await readFile(indexFilePath, "utf-8")
//     }

//     // Check if export already exists (more efficiently than splitting)
//     if (content.includes(exportStatement)) {
//       return
//     }

//     // Append export statement with proper formatting
//     const updatedContent = content.trim()
//       ? `${content}\n\n${exportStatement}\n`
//       : `${exportStatement}\n`

//     await indexFile.write(updatedContent)
//     console.log("✅ Letsync schema export added to index.js")
//   } catch (error) {
//     console.warn("⚠️  Could not update index.ts:", error)
//   }

//   console.log(`✅ Schema generation completed for ${config.dialect}`)

//   const configPath = join(config.out, "config.js")
//   try {
//     await $`bun drizzle-kit generate --config=${configPath}`
//     console.log("✅ Drizzle migration files generated")
//   } catch (error) {
//     console.error("❌ Failed to generate drizzle migrations:", error)
//     throw error
//   }
// }

// -----------------------

// import { join } from "node:path"
// import { write } from "bun"

// import type { OrmConfig } from "@/cli/orm/config.js"

// type ConfigRecord = Record<"client" | "server", OrmConfig>

// export async function generateConfigs(config: OrmConfig) {
//   const envs = ["client", "server"] as const
//   const configs: Partial<ConfigRecord> = {}

//   const promises = envs.map(async (env) => {
//     const basePath = join(config.out, env)
//     const schema = join(basePath, "schema", "index.js")
//     const out = join(basePath, "output")
//     const $config = { ...config, out, schema }
//     configs[env] = $config

//     const content = `import { defineConfig } from "drizzle-kit";\n\nexport default defineConfig(${JSON.stringify($config, null, 2)});`
//     await write(join(process.cwd(), out, "config.js"), content)
//   })

//   await Promise.all(promises)
//   return configs as ConfigRecord
// }

