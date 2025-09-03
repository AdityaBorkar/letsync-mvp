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
  const srcSchemaPath = join(process.cwd(), config.schema)

  console.log("🔄 Generating Configs...")
  const configs = await generateConfigs(config)
  const client = configs.get("client")
  const server = configs.get("server")
  if (!(client && server)) {
    throw new Error("Could not generate configs!")
  }

  console.log("🔄 Generating Schema for [CLIENT]...")
  await generateSchema({
    dialect: client.dialect,
    outPath: join(outPath, "client"),
    schemaPath: srcSchemaPath
  })

  console.log("🔄 Generating Schema for [SERVER]...")
  await generateSchema({
    dialect: server.dialect,
    outPath: join(outPath, "server"),
    schemaPath: srcSchemaPath
  })

  console.log("✅ Schema generation completed")
}

async function generateSchema(params: {
  dialect: string
  schemaPath: string
  outPath: string
}) {
  const { outPath, dialect } = params
  const schemaPath = join(outPath, "./schema")

  if (!(await exists(schemaPath))) {
    await mkdir(schemaPath, { recursive: true })
  }
  await recursiveCopy(params.schemaPath, schemaPath)

  const type = `drizzle-${dialect}`
  const letsyncSchema = join(import.meta.dir, "../../schemas", type)
  if (!(await exists(letsyncSchema))) {
    throw new Error(`Schema type ${type} is not yet supported!`)
  }
  await cp(letsyncSchema, join(schemaPath, "letsync.generated.ts"))

  const schemaFile = file(join(schemaPath, "index.ts"))
  const content = (await schemaFile.exists()) ? await schemaFile.text() : ""
  const lastLine = content.split("\n").pop()
  const LAST_LINE = 'export * from "./letsync.generated.ts";'
  if (lastLine !== LAST_LINE) {
    await schemaFile.write(`${content}\n\n${LAST_LINE}`)
    console.log("Letsync Schema added to index.ts")
  }

  // TODO: Solve the below line:
  await $`bun drizzle-kit generate --config=${join(outPath, "config.ts")}`
  // const command = spawn(["bun", "drizzle-kit generate --config=config.ts"], {
  //   cwd: outPath
  // })
  // await command.exited
  // const output = await command.stdout.text()
}
