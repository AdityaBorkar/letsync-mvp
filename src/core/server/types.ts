import type { ServerDb, ServerFs, ServerPubSub } from "@/types/index.js"

export type ApiContext = {
  db: ServerDb.Adapter<unknown>[]
  fs: ServerFs.Adapter<unknown>[]
  pubsub: ServerPubSub.Adapter
  auth: {
    userId: string
    deviceId: string
  }
}
