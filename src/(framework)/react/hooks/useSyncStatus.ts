import { useContext, useSyncExternalStore } from "react"

import { SyncContext } from "../client/context.js"

export function useSyncStatus() {
  const client = useContext(SyncContext)
  const status = useSyncExternalStore(
    (callback) => {
      const unsubscribe = client.subscribe(
        [
          "network:online",
          "network:offline",
          "sync:start",
          "sync:stop",
          "db:start",
          "db:stop",
          "fs:start",
          "fs:stop"
        ],
        callback
      )
      return unsubscribe
    },
    () => client.getStatus()
    // () => client.getStatus(),
  )

  return status
}
