import type { SQL_Schemas } from "@/types/schemas.js"

import type { GenericObject } from "../../../types/client.js"
import type { DrizzleClientDb } from "./types.js"

export const metadata = { get, remove, set }

async function get(db: DrizzleClientDb, key: string) {
  const data = await db.$client.query<SQL_Schemas.Metadata>(
    `SELECT * FROM "letsync"."client_metadata" WHERE key=$1 LIMIT 1;`,
    [key]
  )
  const record = data.rows[0]
  if (!record) return null

  const { type, value } = record
  if (type === "object") {
    return JSON.parse(value)
  }
  if (type === "boolean") {
    return Boolean(value)
  }
  return String(value)
}

async function remove(db: DrizzleClientDb, key: string) {
  await db.$client.query(
    `DELETE FROM "letsync"."client_metadata" WHERE key=$1;`,
    [key]
  )
}

async function set(
  db: DrizzleClientDb,
  key: string,
  value: string | boolean | GenericObject
) {
  const type = typeof value
  const data = type === "object" ? JSON.stringify(value) : value
  if (!["string", "boolean", "object"].includes(type)) {
    throw new Error("Invalid value type")
  }
  await db.$client.query(
    `INSERT INTO "letsync"."client_metadata" ("key", "type", "value") VALUES ($1, $2, $3) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, type, data]
  )
}

// @ts-expect-error - TODO: Fix this
export type Object = Record<
  string,
  string | number | boolean | null | undefined | Object
>
