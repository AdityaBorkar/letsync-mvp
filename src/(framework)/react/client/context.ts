import { createContext } from "react"

import type { Client as ClientType } from "../../../core/client/config.js"

type Client = ReturnType<typeof ClientType>

export const SyncContext = createContext<Client>(null as unknown as Client)
