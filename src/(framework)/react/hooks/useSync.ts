import { useContext } from "react"

import { SyncContext } from "./context.js"

export function useSync() {
  const client = useContext(SyncContext)
  return client
}
