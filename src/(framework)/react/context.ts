import { createContext } from "react"

import type { Client } from "@/core/client/config.js"

export const Context = createContext<Client>(null as unknown as Client)
