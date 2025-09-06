import { useContext, useRef, useSyncExternalStore } from "react"

import type { Events } from "../../../client/functions/event-manager.js"
import { SyncContext } from "../client/context.js"

const EVENTS = [
  "status:network",
  "status:sync",
  "status:db",
  "status:fs"
] satisfies (keyof Events)[]

export function useSyncStatus() {
  const client = useContext(SyncContext)
  const cachedStatus = useRef<ReturnType<typeof client.getStatus>>({
    isDbRunning: false,
    isFsRunning: false,
    isOnline: false,
    isSyncing: false
  })

  const status = useSyncExternalStore(
    (callback) => {
      const unsubscribe = client.subscribe(EVENTS, callback)
      return unsubscribe
    },
    () => {
      const currentStatus = client.getStatus()

      if (
        !cachedStatus.current ||
        cachedStatus.current.isDbRunning !== currentStatus.isDbRunning ||
        cachedStatus.current.isFsRunning !== currentStatus.isFsRunning ||
        cachedStatus.current.isOnline !== currentStatus.isOnline ||
        cachedStatus.current.isSyncing !== currentStatus.isSyncing
      ) {
        cachedStatus.current = currentStatus
      }

      return cachedStatus.current
    }
  )
  return status
}
