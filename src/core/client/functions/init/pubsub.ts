import type { Context } from "@/core/client/config.ts"
import type { ClientPubSub } from "@/types/client.ts"

export async function initPubsub(props: {
  context: Context
  pubsub: ClientPubSub.Adapter
}) {
  const { context, pubsub } = props

  if (pubsub.syncItems.db.length > 0) {
    for (const { name } of context.db.values()) {
      if (!pubsub.syncItems.db.includes(name)) {
        context.db.delete(name)
      }
    }
  }

  if (pubsub.syncItems.fs.length > 0) {
    for (const { name } of context.fs.values()) {
      if (!pubsub.syncItems.fs.includes(name)) {
        context.fs.delete(name)
      }
    }
  }

  await pubsub.connect(context)
}
