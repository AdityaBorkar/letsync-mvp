import { ArkErrors, type } from "arktype"

import type { Context } from "../config.js"
import { ResponseError } from "../utils/return-error.js"

// TODO: Cache Requests for 365 days, if returns 200 (ISR)
// TODO: Cache Requests for 24 hrs, if returns 404 (ISR)

const schema = type({
  name: "string"
})

export async function schemaLatest(request: Request, context: Context) {
  const { searchParams } = new URL(request.url)
  const data = schema({
    name: searchParams.get("name")
  })
  if (data instanceof ArkErrors) {
    return ResponseError(data.join("\n"))
  }

  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log(context)
  return ResponseError(`TEMPORARILY DISABLED FOR CF WORKERS DEV`)
}

// const { name } = data
// const db = new Pool({
//   // TODO: USE THE CORRECT DYNAMIC DATABASE DEFINED IN CONFIG
//   connectionString: context.db.get(name)?.dbCredentials.url
// })
// const result = await db.query(
//   `SELECT id, init_sql, tag FROM letsync.client_schema WHERE name = $1 AND is_rolled_back = false ORDER BY created_at DESC LIMIT 1`,
//   [name]
// )
// const latestSchema = result.rows[0]
// if (!latestSchema) {
//   return ResponseError(`Latest schema for '${name}' not found`)
// }
// return Response.json(latestSchema)
