import { createContext } from "react"

import type { ClientConfig } from "@/core/client/config/index.js"

export const Context = createContext<ClientConfig>(
  null as unknown as ClientConfig
)

// TODO: INPUT API URL
