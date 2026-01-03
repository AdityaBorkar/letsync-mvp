import { existsSync } from "node:fs"
import { join } from "node:path"

import { ArkErrors } from "arktype"

import { drizzle } from "../orm/drizzle/index.ts"
import type { OrmConfig } from "../orm/types.js"

const FILE_EXTENSIONS = [".js", ".js", ".cjs", ".mjs"] as const

const ORM_CONFIGS: Record<string, OrmConfig> = { drizzle }

export async function detectOrm() {
  console.log("Detecting ORM...")
  const cwd = process.cwd()

  for (const [name, orm] of Object.entries(ORM_CONFIGS)) {
    for (const extension of FILE_EXTENSIONS) {
      const path = join(cwd, `${orm.config.fileName}${extension}`)

      if (existsSync(path)) {
        console.log(`✓ Detected ORM: ${name} (${path})`)
        const { default: unvalidatedConfig } = await import(path)
        const config = orm.config.schema(unvalidatedConfig)
        if (config instanceof ArkErrors) {
          throw new Error(`Invalid config for ${name}: ${config.join("\n")}`)
        }
        return { config, methods: orm.methods, name, path }
      }
    }
  }

  throw new Error(
    "No supported ORM configuration found. Supported ORMs: " +
      Object.keys(ORM_CONFIGS).join(", ")
  )
}
