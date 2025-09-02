import { cp, exists, mkdir } from "node:fs/promises"
import { join } from "node:path"
import { $, file } from "bun"

import { recursiveCopy } from "@/utils/recursive-copy.js"

import type { Config } from "./types.js"
import { generateConfigs } from "./utils.js"

export async function drizzleGenerate(
  config: Config,
  _options: { dryRun: boolean }
) {
  const outPath = join(process.cwd(), config.out)
  const schemaPath = join(outPath, "schema")

  console.log("🔄 Generating Configs...")
  const configs = await generateConfigs(config)
  const client = configs.get("client")
  const server = configs.get("server")
  if (!(client && server)) {
    throw new Error("Could not generate configs!")
  }

  console.log("🔄 Generating Schema for [CLIENT]...")
  await generateSchema(client, schemaPath)

  // console.log("🔄 Generating Schema for [SERVER]...")
  // await generateSchema(server, config.schema)

  console.log("✅ Schema generation completed")
}

async function generateSchema(config: Config, srcSchemaPath: string) {
  const PREFIX = "./drizzle/client"
  const outPath = join(process.cwd(), PREFIX, config.out)
  const schemaPath = join(outPath, config.schema)
  console.log({ outPath, schemaPath })

  if (!(await exists(schemaPath))) {
    await mkdir(schemaPath, { recursive: true })
  }

  await recursiveCopy(srcSchemaPath, schemaPath)

  const type = `drizzle-${config.dialect}`
  const letsyncSchema = await getLetsyncSchemaFilePath(type)
  await cp(letsyncSchema, join(schemaPath, "letsync.generated.ts"))

  const schemaFile = file(join(schemaPath, "index.ts"))
  const content = (await schemaFile.exists()) ? await schemaFile.text() : ""
  const lastLine = content.split("\n").pop()
  const LAST_LINE = 'export * from "./letsync.generated.ts";'
  if (lastLine !== LAST_LINE) {
    await schemaFile.write(`${content}\n\n${LAST_LINE}`)
    console.log("Letsync Schema added to index.ts")
  }

  await $`bun drizzle-kit generate --config=${join(PREFIX, "config.ts")}`
  // await $`bun drizzle-kit generate --config=${join("./drizzle/server", "config.ts")}`

  return { outPath, schemaPath }
}

async function getLetsyncSchemaFilePath(type: string) {
  const letsyncSchema = join(import.meta.dir, "../../schemas", type)
  if (!(await exists(letsyncSchema))) {
    throw new Error(`Schema type ${type} is not yet supported!`)
  }
  return letsyncSchema
}
