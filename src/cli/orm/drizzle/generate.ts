import { cp, exists, mkdir, readdir, stat, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"
import { $, file } from "bun"

import type { Config } from "./types.js"
import { generateConfig } from "./utils.js"

export async function drizzleGenerate(
  config: Config,
  _options: { dryRun: boolean }
) {
  const configs = await generateConfig(config)
  const clientConfig = configs.get("client")
  const serverConfig = configs.get("server")
  if (!(clientConfig && serverConfig)) {
    throw new Error("No client or server config found!")
  }

  console.log("🔄 Generating Schema for [CLIENT]...")
  const client = await generateSchema(clientConfig)
  await $`bun drizzle-kit generate --config=${client.outPath}/config.ts`
  // const journal = await getJournal(client.outPath);
  // const migrationCount = journal.migrations.length;
  // const latestMigration = journal.migrations[migrationCount - 1];
  // const latestTag = latestMigration.tag;
  // console.log({ latestTag });
  // const latestSnapshot = String(migrationCount - 1).padStart(4, "0");
  // const sql = (
  // 	await $`bunx drizzle-kit export --config=${client.outPath}/config.ts`
  // ).stdout;
  // await writeFile(join(client.outPath, "/sql/"), sql);

  console.log("🔄 Generating Schema for [SERVER]...")
  const server = await generateSchema(serverConfig)
  await $`bun drizzle-kit generate --config=${server.outPath}/config.ts`

  console.log("✅ Schema generation completed")
}

async function generateSchema(config: Config) {
  const outPath = join(process.cwd(), config.out)
  const schemaPath = join(outPath, "/schema")
  if (!(await exists(schemaPath))) {
    await mkdir(schemaPath, { recursive: true })
  }

  const _schemaPath = join(resolve(config.schema), "../") // ! TEMPORARY FIX
  await recursiveCopy(_schemaPath, schemaPath)

  const type = `drizzle-${config.dialect}`
  const letsyncSchema = join(import.meta.dir, "../../schemas", type)
  if (!(await exists(letsyncSchema))) {
    throw new Error(`Schema type ${type} is not yet supported!`)
  }
  await cp(letsyncSchema, join(schemaPath, "letsync.generated.ts"))

  const schemaFile = file(join(schemaPath, "index.ts"))
  const schemaText = `${await schemaFile.text()}\n\nexport * from "./letsync.generated";`
  await schemaFile.write(schemaText)

  return { outPath, schemaPath }
}

async function recursiveCopy(src: string, dest: string) {
  const files = await readdir(src)
  for await (const name of files) {
    const srcPath = join(src, name)
    const destPath = join(dest, name)
    if ((await stat(srcPath)).isDirectory()) {
      await recursiveCopy(srcPath, destPath)
    } else {
      const content = await file(srcPath).text()
      // TODO: TRANSFORM `content`
      await writeFile(destPath, content)
    }
  }
}
