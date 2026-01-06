// import type { SQL_Schemas } from "@/types/schemas.js"

import type { ClientDb } from "@/types/client.js"

import type { Context } from "../config.js"
import { VERSION_KEY } from "../constants.js"

export async function SchemaCheckForUpdates(
  props: { name: string } | { db: ClientDb.Adapter<unknown> },
  context: Context
) {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log("SchemaCheckForUpdates", { context, props, VERSION_KEY })

  // const db = "name" in props ? context.db.get(props.name) : props.db
  // if (!db) {
  //   throw new Error("Database not found")
  // }

  // const version = await db.metadata.get(`${VERSION_KEY}:${db.name}`)
  // if (version === null) {
  //   throw new Error("No version found")
  // }

  // TODO: WRITE LOGIC

  // const schemas = await context.fetch("GET", "/schema", {
  //   searchParams: { from: String(CurrentVersion), name: db.name }
  // })
  // if (schemas.error) {
  //   throw new Error(schemas.error.toString())
  // }
  // const _schemas = schemas.data as SQL_Schemas.Schema[]
  // // TODO: INSERT DATA
  // await db.schema.migrate({ idx: _schemas[0].idx })
}
