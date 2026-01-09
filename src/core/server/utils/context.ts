import { AsyncLocalStorage } from "node:async_hooks"

import type { LetsyncConfig } from "@/core/server/config/index.js"

export type ContextType = LetsyncConfig & {
  debug?: {
    prefix?: string
    color?: string
  }
}

export const Context = new AsyncLocalStorage<ContextType>()
