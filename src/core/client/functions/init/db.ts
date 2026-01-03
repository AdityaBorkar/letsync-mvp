import type { Context } from "@/core/client/config.js"
import type { ClientDb } from "@/types/client.js"
import type { SQL_Schemas } from "@/types/schemas.js"

import { Logger } from "../../../../utils/logger.js"
import { tryCatch } from "../../../../utils/try-catch.js"
import { VERSION_KEY } from "../../constants.js"
import { SchemaCheckForUpdates } from "../schema-check-for-updates.js"
import { SchemaUpgrade } from "../schema-upgrade.js"

export async function initDb(props: {
  context: Context
  db: ClientDb.Adapter<unknown>
  checkForUpdates: boolean
  autoUpgrade: boolean
}) {
  const { context, db, checkForUpdates, autoUpgrade } = props
  const logger = new Logger(db.name)

  logger.log("Establishing connection")
  await db.connect()

  logger.log("Schema Version: Reading from metadata")
  const { data: version, error } = await tryCatch(db.metadata.get(VERSION_KEY))

  if (
    error?.cause &&
    !error?.cause
      ?.toString()
      .endsWith('relation "client_metadata" does not exist')
  ) {
    logger.error("Schema Version: Error reading from metadata", error.cause)
    throw error.cause
  }

  logger.log(`Schema Version: ${version}`)

  if (version === null) {
    logger.log("Schema: Fetching from server")
    const response = await context.fetch("GET", "/schema", {
      searchParams: { name: db.name }
    })
    if (response.error) {
      logger.error(`Schema: Error fetching from server`, response.error)
      return
    }
    const schemas = response.data as SQL_Schemas.Schema[]
    logger.log(`Schema: Initializing`, schemas)
    await db.schema.initialize(schemas[0])
    logger.log("Schema: Initialized")
    return
  }

  // Run schema operations sequentially per database
  if (checkForUpdates) {
    await SchemaCheckForUpdates({ db }, context)
  }

  if (autoUpgrade) {
    await SchemaUpgrade({ db, version: { latest: true } }, context)
  }
}
