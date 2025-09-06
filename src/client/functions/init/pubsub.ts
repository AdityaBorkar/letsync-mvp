import type { Context } from "@/client/config.js"
import type { ClientPubSub } from "@/types/client.js"

export async function initPubsub(props: {
  context: Context
  pubsub: ClientPubSub.Adapter
}) {
  const { context, pubsub } = props

  const apiUrl = context.apiUrl
  const signal = context.controller.signal

  const dbList = Array.from(context.db.values())
  const db =
    pubsub.syncItems.db.length > 0
      ? dbList.filter((db) => pubsub.syncItems.db.includes(db.name))
      : dbList

  const fsList = Array.from(context.fs.values())
  const fs =
    pubsub.syncItems.fs.length > 0
      ? fsList.filter((fs) => pubsub.syncItems.fs.includes(fs.name))
      : fsList

  await pubsub.connect({ apiUrl, db, fs, signal })
}
