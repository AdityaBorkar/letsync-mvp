import type { Context } from "../config.js"

export function SyncTerminate(_: undefined, context: Context) {
  context.status.isSyncing.set(false)
  for (const [, pubsub] of context.pubsub.entries()) {
    pubsub.close()
  }

  context.status.isFsRunning.set(false)
  for (const [, fs] of context.fs.entries()) {
    fs.close()
  }

  context.status.isDbRunning.set(false)
  for (const [, db] of context.db.entries()) {
    db.close()
  }

  context.controller.abort()
}
