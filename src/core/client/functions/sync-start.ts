import type { Context } from "../config/index.js"
import { initDb } from "./init/db.js"
import { initFs } from "./init/fs.js"
import { initPubsub } from "./init/pubsub.js"

export async function SyncStart(
  props: { autoUpgrade: boolean; checkForUpdates: boolean },
  context: Context
) {
  // Process all databases in parallel
  const { checkForUpdates, autoUpgrade } = props
  const dbArray = Array.from(context.db.values())
  await Promise.all(
    dbArray.map((db) =>
      initDb({ autoUpgrade, checkForUpdates, context, db }).catch((error) => {
        console.error(`Error processing database ${db.name}:`, error)
        throw error
      })
    )
  )
  context.status.isDbRunning.set(true)

  // Process all filesystems in parallel
  const fsArray = Array.from(context.fs.values())
  await Promise.all(
    fsArray.map((fs) =>
      initFs({ context, fs }).catch((error) => {
        console.error(`Error processing filesystem ${fs.name}:`, error)
        throw error
      })
    )
  )
  context.status.isFsRunning.set(true)

  // Process all pubsub clients in parallel
  const pubsubArray = Array.from(context.pubsub.values())
  await Promise.all(
    pubsubArray.map((pubsub) =>
      initPubsub({ context, pubsub }).catch((error) => {
        console.error(`Error processing pubsub ${pubsub.name}:`, error)
        throw error
      })
    )
  )
  context.status.isSyncing.set(true)
}
