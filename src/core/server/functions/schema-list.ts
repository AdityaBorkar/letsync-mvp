import { ArkErrors, type } from "arktype"

import type { Context } from "../config.ts"
import { ResponseError } from "../utils/return-error.ts"

// TODO: Cache Requests for 365 days, if returns 200 (ISR)
// TODO: Cache Requests for 24 hrs, if returns 404 (ISR)

const schema = type({
  name: "string",
  version: "number | undefined"
})

export async function schemaList(request: Request, context: Context) {
  const { searchParams } = new URL(request.url)
  const data = schema({
    name: searchParams.get("name"),
    version: searchParams.get("version") ?? undefined
  })
  if (data instanceof ArkErrors) {
    return ResponseError(data.join("\n"))
  }

  const { name, version } = data
  const db = context.db.get(name)
  if (!db) {
    return ResponseError(`Database '${name}' not found`)
  }

  const params = version ? { aboveVersion: version?.toString() } : undefined
  const records = await db.schema.list(params)
  if (records.length === 0) {
    return ResponseError(`Schema version '${version}' not found`)
  }
  return Response.json(records)
}
