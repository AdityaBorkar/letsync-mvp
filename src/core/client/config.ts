import type { ClientDb, ClientFs, ClientPubSub } from "@/types/client.js"

import { FetchClient } from "../../utils/fetch-client.js"
import { Signal } from "../../utils/signal.js"
// import { DeviceDeregister } from "./functions/device-deregister.js";
// import { DeviceRegister } from "./functions/device-register.js";
import { EventManager } from "./functions/event-manager.js"
import { SchemaCheckForUpdates } from "./functions/schema-check-for-updates.js"
import { SchemaList } from "./functions/schema-list.js"
import { SchemaUpgrade } from "./functions/schema-upgrade.js"
import { SchemaVerify } from "./functions/schema-verify.js"
import { SyncStart } from "./functions/sync-start.js"
import { SyncTerminate } from "./functions/sync-terminate.js"

export type ClientConfig = ReturnType<typeof ClientConfig>

export type Context = {
  apiUrl: string
  db: Map<string, ClientDb.Adapter<unknown>>
  fs: Map<string, ClientFs.Adapter<unknown>>
  pubsub: Map<string, ClientPubSub.Adapter>
  controller: AbortController
  status: {
    isDbRunning: Signal<boolean>
    isFsRunning: Signal<boolean>
    isSyncing: Signal<boolean>
    isOnline: Signal<boolean>
  }
  fetch: ReturnType<typeof FetchClient>
}

type ClientAuthMiddleware = () => Promise<{ userId: string; deviceId: string }>

export type Config = {
  apiUrl: string
  auth: ClientAuthMiddleware
  connections: (
    | ClientPubSub.Adapter
    | ClientDb.Adapter<unknown>
    | ClientFs.Adapter<unknown>
  )[]
}

export function ClientConfig(config: Config) {
  if (typeof window === "undefined") {
    throw new Error("LetSync can only be used in the client")
  }

  // * Adapters
  const db = new Map<string, ClientDb.Adapter<unknown>>()
  const fs = new Map<string, ClientFs.Adapter<unknown>>()
  const pubsub = new Map<string, ClientPubSub.Adapter>()
  for (const item of config.connections) {
    if (item.__brand.startsWith("LETSYNC_SERVER")) {
      throw new Error("Server Adapters are not allowed on client side.")
    }
    if (item.__brand === "LETSYNC_CLIENT_DB") {
      db.set(item.name, item)
      continue
    }
    if (item.__brand === "LETSYNC_CLIENT_FS") {
      fs.set(item.name, item)
      continue
    }
    if (item.__brand === "LETSYNC_CLIENT_PUBSUB") {
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
  // if (!config.auth) {
  // 	throw new Error("Auth middleware is required");
  // }

  // * Utils
  const GarbageCollector: (() => void)[] = []
  const controller = new AbortController()
  const fetch = FetchClient(config.apiUrl)

  // * Event Manager
  const { subscribe, unsubscribe, emit } = EventManager()

  // * Status
  const isOnline = new Signal(false)
  const isSyncing = new Signal(false)
  const isDbRunning = new Signal(false)
  const isFsRunning = new Signal(false)
  isOnline.onChange((value) => {
    emit("status:network", value)
  })
  isSyncing.onChange((value) => {
    emit("status:sync", value)
  })
  isDbRunning.onChange((value) => {
    emit("status:db", value)
  })
  isFsRunning.onChange((value) => {
    emit("status:fs", value)
  })
  const getStatus = () => ({
    isDbRunning: isDbRunning.get(),
    isFsRunning: isFsRunning.get(),
    isOnline: isOnline.get(),
    isSyncing: isSyncing.get()
  })

  // * Online Check
  const handleOnline = () => isOnline.set(true)
  const handleOffline = () => isOnline.set(false)
  window.addEventListener("online", handleOnline)
  window.addEventListener("offline", handleOffline)
  GarbageCollector.push(() => {
    window.removeEventListener("online", handleOnline)
    window.removeEventListener("offline", handleOffline)
  })

  // * Context
  const status = { isDbRunning, isFsRunning, isOnline, isSyncing }
  const apiUrl = config.apiUrl
  const context: Context = { apiUrl, controller, db, fetch, fs, pubsub, status }

  // * Primitive Functions
  const schema = {
    checkForUpdates: (_: Parameters<typeof SchemaCheckForUpdates>[0]) =>
      SchemaCheckForUpdates(_, context),
    list: (_: Parameters<typeof SchemaList>[0]) => SchemaList(_, context),
    upgrade: (_: Parameters<typeof SchemaUpgrade>[0]) =>
      SchemaUpgrade(_, context),
    verify: (_: Parameters<typeof SchemaVerify>[0]) => SchemaVerify(_, context)
  }

  // * Compound Functions
  const sync = {
    start: (
      _: Parameters<typeof SyncStart>[0] = {
        autoUpgrade: true,
        checkForUpdates: true
      }
    ) => SyncStart(_, context),
    terminate: () => SyncTerminate(undefined, context)
  }

  return {
    db,
    fs,
    getStatus,
    pubsub,
    schema,
    subscribe,
    sync,
    unsubscribe
  }
}
