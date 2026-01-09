import { AsyncLocalStorage } from "node:async_hooks"

import type { ServerContext } from "@/core/server/config.js"

export type ContextType = ServerContext & {
  debug?: {
    prefix?: string
    color?: string
  }
}

export const Context = new AsyncLocalStorage<ContextType>()
