import { mkdir } from "node:fs/promises"
import { join } from "node:path"
import { file } from "bun"

import type { OrmConfigOutputType } from "@/cli/orm/config.js"

export async function generateConfig(
  config: (typeof OrmConfigOutputType)["infer"]
) {
  const { dialect, name, dir, orm, ..._config } = config
  console.log(`🔄 Generating config for [${dialect}] in [${dir}]...`)

  const $config = {
    ..._config,
    dialect,
    out: join("./", dir, "migrations"),
    schema: join("./", dir, "schema", "index.js"),
    strict: true,
    verbose: true
  }
  const content = `import { defineConfig } from "drizzle-kit";\n\nexport default defineConfig(${JSON.stringify($config, null, 2)});`

  await mkdir(dir, { recursive: true })
  const filePath = join(process.cwd(), dir, "config.js")
  await file(filePath).write(content)
}
