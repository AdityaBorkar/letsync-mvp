import type { Context } from "../config/index.js"

export async function SyncTerminate(_: undefined, context: Context) {
  context.status.isSyncing.set(false)
  context.status.isFsRunning.set(false)
  context.status.isDbRunning.set(false)

  const pubsubArray = Array.from(context.pubsub.values())
  const fsArray = Array.from(context.fs.values())
  const dbArray = Array.from(context.db.values())

  const disconnectPromises = [
    ...pubsubArray.map((pubsub) => pubsub.disconnect()),
    ...fsArray.map((fs) => fs.close()),
    ...dbArray.map((db) => db.close())
  ]

  await Promise.allSettled(
    disconnectPromises.map((promise) =>
      promise?.catch((error: unknown) =>
        console.error("Service disconnect failed:", error)
      )
    )
  )
}
