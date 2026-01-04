import type { Options, OrmConfig } from "@/cli/orm/config.js"

export function migrate(config: OrmConfig, options: Options) {
  const { dryRun } = options
  if (dryRun) {
    console.log("🔄 Dry run mode is currently WIP. Early Return.")
    return
  }

  console.log("🔄 Migrating Prisma schema...")
  console.log({ config })
}
