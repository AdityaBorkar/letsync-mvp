import { ArkErrors, type } from "arktype"

import type { Context } from "../config.js"

// TODO: Cache Requests for 365 days, if returns 200 (ISR)
// TODO: Cache Requests for 24 hrs, if returns 404 (ISR)

// ! WORK ON THIS ENTIRE API ENDPOINT
// TODO: HANDLE MIGRATION SCRIPTS IN THE CLOUD AND EXECUTE ONLY CALLS OVER HERE. MAKE SURE THEY ARE IDEMPOTENT.

const schema = type({
  from: "number",
  name: "string",
  "to?": "number"
})

export function schemaMigrate(request: Request, context: Context) {
  // Request Validation
  const { searchParams } = new URL(request.url)
  const data = schema({
    from: searchParams.get("from")
      ? Number.parseInt(searchParams.get("from") ?? "0", 10)
      : null,
    name: searchParams.get("name"),
    to: searchParams.get("to")
      ? Number.parseInt(searchParams.get("to") ?? "0", 10)
      : null
  })

  if (data instanceof ArkErrors) {
    return Response.json({ error: data.summary }, { status: 400 })
  }

  const { from, to } = data

  // Validation: from and to cannot be the same
  if (from === to) {
    const error = "from and to cannot be the same"
    return Response.json({ error }, { status: 400 })
  }

  // Validation: from must be older than to
  if (to && from > to) {
    const error = "from must be older than to"
    return Response.json({ error }, { status: 400 })
  }

  const serverDb = context.db.get("postgres") // ! REPLACE HARDCODED DB NAME
  if (!serverDb) {
    throw new Error("Server database not found")
  }

  return Response.json(
    { error: "No migration found or migration already up to date" },
    { status: 404 }
  )

  // Generate migration SQL
  // const result = "" // await generateMigrationSql(serverDb, from, to, name)
  // if (!result) {
  //   return Response.json(
  //     { error: "No migration found or migration already up to date" },
  //     { status: 404 }
  //   )
  // }

  // return Response.json({
  //   fromVersion: from,
  //   migrations: result.migrations,
  //   name: name,
  //   sql: result.sql,
  //   timestamp: new Date().toISOString(),
  //   toVersion: result.toVersion
  // })
}
