import type {
  ApiHandlerAuth,
  ServerDb,
  ServerFs,
  ServerPubSub
} from "@/types/index.js"

import { apiHandler } from "./api-handler.js"

export type Server = ReturnType<typeof LetsyncServer>

export type Context = {
  auth: ApiHandlerAuth
  apiUrl: string
  db: Map<string, ServerDb.Adapter<unknown>>
  fs: Map<string, ServerFs.Adapter<unknown>>
  pubsub: Map<string, ServerPubSub.Adapter>
}

export type LetsyncConfig = {
  apiUrl: string
  shadowDbName?: string
  auth: ApiHandlerAuth
  connections: (
    | ServerPubSub.Adapter
    | ServerDb.Adapter<unknown>
    | ServerFs.Adapter<unknown>
  )[]
}

export function LetsyncServer(config: LetsyncConfig) {
  if (typeof window !== "undefined" || typeof process === "undefined") {
    throw new Error("LetSync can only be used in the server")
  }

  // * Adapters
  const db: Map<string, ServerDb.Adapter<unknown>> = new Map()
  const fs: Map<string, ServerFs.Adapter<unknown>> = new Map()
  const pubsub: Map<string, ServerPubSub.Adapter> = new Map()

  const { auth, apiUrl, connections } = config
  if (!auth) {
    throw new Error("Auth middleware is required")
  }
  if (!apiUrl) {
    throw new Error("API URL is required")
  }
  for (const item of connections) {
    if (item.__brand.startsWith("LETSYNC_CLIENT_")) {
      throw new Error("Client Adapters are not allowed on server side.")
    }
    if (item.__brand === "LETSYNC_SERVER_DB") {
      db.set(item.name, item)
      continue
    }
    if (item.__brand === "LETSYNC_SERVER_FS") {
      fs.set(item.name, item)
      continue
    }
    if (item.__brand === "LETSYNC_SERVER_PUBSUB") {
      pubsub.set(item.name, item)
      continue
    }
    throw new Error("Invalid adapter type")
  }
  // if (fs.size === 0 && db.size === 0) {
  //   throw new Error("No database or filesystem configured")
  // }
  // if (pubsub.size === 0) {
  //   throw new Error("No pubsub configured")
  // }

  const context: Context = { apiUrl, auth, db, fs, pubsub }

  return {
    apiHandler: (request: Request) => apiHandler(request, context),
    context
  }
}
