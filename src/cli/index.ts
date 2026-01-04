#!/usr/bin/env bun

/** biome-ignore-all lint/performance/noNamespaceImport: BARREL FILE */

import { Command } from "commander"

import { detectConfig } from "@/cli/orm/detect-config.js"

import * as drizzle from "./orm/drizzle/index.js"
import * as prisma from "./orm/prisma/index.js"
import { detectEnv } from "./utils/detect-env.js"

// import { detectOrm } from "./utils/detect-orm.js"

const program = new Command()

program
  .name("letsync")
  .description("LetSync")
  .version("0.0.1")
  .hook("preAction", () => {
    const env = detectEnv()
    console.log("--- LetSync ---")
    console.log(`Environment: ${env.name.toUpperCase()} (${env.description})`)
    console.log("")
  })

program
  .command("generate")
  .description("Generate ORM schemas")
  .option("--dry-run", "Show what would be generated without creating files")
  // .option("--config <config>", "The config file to use")
  .action(async ({ dryRun = false }) => {
    const { config } = await detectConfig()
    if (config.source.orm === "drizzle") {
      return await drizzle.generate(config, { dryRun })
    }
    if (config.source.orm === "prisma") {
      return await prisma.generate(config, { dryRun })
    }
    throw new Error(`ORM '${config.source.orm}' is not supported`)
  })

// program
//   .command("migrate")
//   .description("Migrate schema changes to the database")
//   .option("--dry-run", "Show what would be generated without creating files")
//   .action(async ({ dryRun = false }) => {
//     const { config, methods } = await detectOrm()
//     await methods.migrate(config, { dryRun })
//   })

// program
//   .command("push")
//   .description("Push a schema to the database")
//   .option("--dry-run", "Show what would be generated without creating files")
//   .action(async ({ dryRun = false }) => {
//     const { config, methods } = await detectOrm()
//     await methods.push(config, { dryRun })
//   })

program.on("command:*", () => {
  console.error(
    "Invalid command: %s\nSee --help for a list of available commands.",
    program.args.join(" ")
  )
  process.exit(1)
})

program.parse()
