import { join } from "node:path"
import { file, write } from "bun"

import type { Config } from "./types.js"

export async function generateConfigs(config: Config) {
  const paths = ["client", "server"] as const
  const configs = new Map<"client" | "server", Omit<Config, "schema">>()
  for await (const path of paths) {
    const $config = {
      ...config,
      out: `drizzle/${path}`,
      schema: `drizzle/${path}/schema/index.ts`
    }

    const content = `import { defineConfig } from "drizzle-kit";\n\nexport default defineConfig(${JSON.stringify($config, null, 2)});`
    const configPath = join(process.cwd(), "drizzle", path, "config.ts")
    await write(configPath, content)

    // @ts-expect-error
    // biome-ignore lint/performance/noDelete: TODO
    delete $config.schema
    configs.set(path, $config)
  }
  return configs
}

export async function getJournal(outPath: string) {
  const journalPath = join(outPath, "/meta/_journal.json")
  const journal = await file(journalPath).json()
  return journal
}
