import type {
  ApiHandlerAuth,
  ServerDb,
  ServerFs,
  ServerPubSub
} from "@/types/index.js"

import { apiHandler } from "./api-handler.js"

export type Server = ReturnType<typeof LetsyncServer>

export type Context = {
  auth: ApiHandlerAuth<Request>
  apiUrl: { path: string; domain: string; https: boolean }
  db: Map<string, ServerDb.Adapter<unknown>>
  fs: Map<string, ServerFs.Adapter<unknown>>
  pubsub: Map<string, ServerPubSub.Adapter>
}

export type LetsyncConfig<R extends Request> = {
  apiUrl: { path: string; domain: string; https: boolean }
  auth: ApiHandlerAuth<R>
  connections: (
    | ServerPubSub.Adapter
    | ServerDb.Adapter<unknown>
    | ServerFs.Adapter<unknown>
  )[]
}

export function LetsyncServer<R extends Request>(config: LetsyncConfig<R>) {
  if (typeof window !== "undefined" || typeof process === "undefined") {
    throw new Error("LetSync can only be used in the server")
  }

  // * Adapters
  const db: Map<string, ServerDb.Adapter<unknown>> = new Map()
  const fs: Map<string, ServerFs.Adapter<unknown>> = new Map()
  const pubsub: Map<string, ServerPubSub.Adapter> = new Map()
  for (const item of config.connections) {
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
  if (fs.size === 0 && db.size === 0) {
    throw new Error("No database or filesystem configured")
  }
  if (pubsub.size === 0) {
    throw new Error("No pubsub configured")
  }

  // TODO - Auth Provider check
  const { auth } = config
  if (!auth) {
    throw new Error("Auth middleware is required")
  }

  const apiUrl = config.apiUrl || {
    domain: "localhost:3000",
    https: false,
    path: "/api/sync"
  }

  // @ts-expect-error
  const context: Context = { apiUrl, auth, db, fs, pubsub }

  return {
    apiHandler: (request: Request) => apiHandler(request, context),
    context
  }
}
