import type { Options, OrmConfig } from "../../orm/config.js"

export async function generate(config: OrmConfig, options: Options) {
  const { dryRun } = options

  if (dryRun) {
    console.log("🔄 Dry run mode is currently WIP. Early Return.")
    return
  }

  console.log("🔄 Generating Prisma schema...")
  console.log({ config })

  await 0
}
