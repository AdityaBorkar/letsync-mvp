import { useContext } from "react"

import { Context } from "../client/context.js"

export function useSync() {
  const client = useContext(Context)
  return client
}
