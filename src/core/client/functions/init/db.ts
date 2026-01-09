import type { Context } from "@/core/client/config.js"
import type { ClientDb } from "@/types/client.js"
import type { SQL_Schemas } from "@/types/index.js"

import { tryCatch } from "../../../../utils/try-catch.js"
import { VERSION_KEY } from "../../constants.js"
import { logger } from "../../utils/logger.js"
import { SchemaCheckForUpdates } from "../schema-check-for-updates.js"
import { SchemaUpgrade } from "../schema-upgrade.js"

export async function initDb(props: {
  context: Context
  db: ClientDb.Adapter<unknown>
  checkForUpdates: boolean
  autoUpgrade: boolean
}) {
  const { context, db, checkForUpdates, autoUpgrade } = props

  logger.log("Connecting")
  await db.connect()
  logger.log("Connected")

  const { data: version, error } = await tryCatch(
    db.metadata.get(`${VERSION_KEY}:${db.name}`)
  )
  logger.log(`Schema Version: ${version} (from metadata)`)
  if (
    error?.cause &&
    !error?.cause
      ?.toString()
      .endsWith('relation "client_metadata" does not exist')
  ) {
    logger.error("Schema Version: Error reading from metadata", error.cause)
    throw error.cause
  }

  if (version === null) {
    const response = await context.fetch("GET", "/schema/latest", {
      searchParams: { name: db.name }
    })
    if (response.error) {
      logger.error(`Schema: Error fetching from server`, response.error)
      return
    }
    const schema = response.data as SQL_Schemas.Schema
    logger.log(`Schema: Initializing ${schema.name} ${schema.tag}`)
    try {
      await db.schema.initialize(schema)
    } catch (error) {
      if (!String(error).includes("already exists")) {
        throw error
      }
      await db.flush()
      await db.schema.initialize(schema)
    }
    logger.log("Schema: Initialized")
    return
  }

  console.log("----------------")

  // Run schema operations sequentially per database
  if (checkForUpdates) {
    await SchemaCheckForUpdates({ db }, context)
  }

  if (autoUpgrade) {
    await SchemaUpgrade({ db, version: { latest: true } }, context)
  }
}
