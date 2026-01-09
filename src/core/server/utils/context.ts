import { AsyncLocalStorage } from "node:async_hooks"

import type { Config } from "@/core/server/config.js"

export type ContextType = Config & {
  debug?: {
    prefix?: string
    color?: string
  }
}

export const Context = new AsyncLocalStorage<ContextType>()
