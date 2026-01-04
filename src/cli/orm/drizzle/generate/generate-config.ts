import { mkdir } from "node:fs/promises"
import { join } from "node:path"
import { file } from "bun"

import type { OrmDialectType } from "@/cli/orm/config.js"

export async function generateConfig({
  dialect,
  dir
}: {
  dialect: (typeof OrmDialectType)["infer"]
  dir: string
}) {
  console.log(`🔄 Generating config for [${dialect}] in [${dir}]...`)

  const $config = {
    // ...config,
    // dbCredentials: { url: process.env.DATABASE_URL ?? "" },
    dialect,
    out: join(dir, "migrations"),
    schema: join(dir, "schema", "index.ts"),
    strict: true,
    verbose: true
  }
  const content = `import { defineConfig } from "drizzle-kit";\n\nexport default defineConfig(${JSON.stringify($config, null, 2)});`

  await mkdir(dir, { recursive: true })
  const filePath = join(process.cwd(), dir, "drizzle.config.js")
  await file(filePath).write(content)
}
