import { mkdir } from "node:fs/promises"
import { join } from "node:path"
import { file } from "bun"

import { globSync } from "glob"

import type { OrmDialectType } from "@/cli/orm/config.js"
import { letsyncSchema } from "@/cli/orm/drizzle/generate/schema.js"

export async function generateSchema(props: {
  source: {
    dialect: (typeof OrmDialectType)["infer"]
    dir: string
  }
  target: {
    dialect: (typeof OrmDialectType)["infer"]
    dir: string
  }
}) {
  const { source, target } = props

  console.log(
    `🔄 Generating schema in "${target.dir}" [${source.dialect} -> ${target.dialect}]...`
  )

  // Find all TypeScript files in source directory
  const files = globSync("**/*.ts", { cwd: source.dir })
  console.log(`Found ${files.length} schema files to convert`)

  // TODO: Merge all into a single file

  // Convert each file
  for await (const fileName of files) {
    const sourcePath = join(source.dir, fileName)
    const targetPath = join(target.dir, fileName)

    // console.log(`Converting ${fileName}...`)
    const content = await file(sourcePath).text()
    const dist = convertSchema({
      content,
      sourceDialect: source.dialect,
      targetDialect: target.dialect
    })

    const targetSubDir = join(target.dir, ...fileName.split("/").slice(0, -1))
    await mkdir(targetSubDir, { recursive: true })
    await file(targetPath).write(dist)
    // console.log(`✓ Converted ${fileName}`)
  }

  const dist = convertSchema({
    content: letsyncSchema,
    sourceDialect: "postgresql",
    targetDialect: target.dialect
  })
  await file(join(target.dir, "letsync.ts")).write(dist)

  console.log("\n✅ Schema conversion complete!")
}

function convertSchema(props: {
  content: string
  targetDialect: (typeof OrmDialectType)["infer"]
  sourceDialect: (typeof OrmDialectType)["infer"]
}): string {
  let { content, targetDialect, sourceDialect } = props

  const dialects = {
    cockroach: {
      enum: "cockroachEnum",
      module: "cockroach-core",
      schema: "cockroachSchema",
      table: "cockroachTable"
    },
    postgresql: {
      enum: "pgEnum",
      module: "pg-core",
      schema: "pgSchema",
      table: "pgTable"
    }
    // TODO: Find data types that are not convertable
  }

  const srcProps = dialects[sourceDialect]
  const targetProps = dialects[targetDialect]

  content = content.replace(
    new RegExp(`["']drizzle-orm\\/${srcProps.module}["']`, "gmi"),
    `"drizzle-orm/${targetProps.module}"`
  )
  content = content.replace(
    new RegExp(`\\b${srcProps.table}\\b`, "gmi"),
    targetProps.table
  )
  content = content.replace(
    new RegExp(`\\b${srcProps.enum}\\b`, "gmi"),
    targetProps.enum
  )

  return content
}
