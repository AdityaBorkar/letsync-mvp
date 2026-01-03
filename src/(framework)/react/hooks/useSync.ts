import { useContext } from "react"

import { SyncContext } from "../client/context.ts"

export function useSync() {
  const client = useContext(SyncContext)
  return client
}
