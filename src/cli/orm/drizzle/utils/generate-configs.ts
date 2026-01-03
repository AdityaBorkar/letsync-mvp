import { join } from "node:path"
import { write } from "bun"

import type { Config } from "../index.ts"

type ConfigRecord = Record<"client" | "server", Config>

export async function generateConfigs(config: Config) {
  const envs = ["client", "server"] as const
  const configs: Partial<ConfigRecord> = {}

  const promises = envs.map(async (env) => {
    const basePath = join(config.out, env)
    const schema = join(basePath, "schema", "index.ts")
    const out = join(basePath, "output")
    const $config = { ...config, out, schema }
    configs[env] = $config

    const content = `import { defineConfig } from "drizzle-kit";\n\nexport default defineConfig(${JSON.stringify($config, null, 2)});`
    await write(join(process.cwd(), out, "config.ts"), content)
  })

  await Promise.all(promises)
  return configs as ConfigRecord
}
