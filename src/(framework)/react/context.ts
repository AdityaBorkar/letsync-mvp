import { createContext } from "react"

import type { Client } from "@/core/client/config.ts"

export const Context = createContext<Client>(null as unknown as Client)
