import { existsSync } from "node:fs"
import { join } from "node:path"

import { ArkErrors } from "arktype"

import { OrmConfigSchema } from "@/cli/orm/config.js"

const FILE_EXTENSIONS = ["js", "cjs", "mjs", "ts"] as const

export async function detectConfig() {
  const cwd = process.cwd()

  for (const extension of FILE_EXTENSIONS) {
    const path = join(cwd, `letsync.config.${extension}`)
    if (existsSync(path)) {
      console.log(`✓ Detected Config: ${path}`)
      const { orm } = await import(path)
      const orm_config = OrmConfigSchema(orm)
      if (orm_config instanceof ArkErrors) {
        throw new Error(`Invalid config: ${orm_config.join("\n")}`)
      }
      return { config: orm_config, path }
    }
  }

  throw new Error("No configuration found.")
}
