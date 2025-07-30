import { createContext } from "react";

import type { LetSyncClient } from "@/client/config.js";

type Client = ReturnType<typeof LetSyncClient>;

export const SyncContext = createContext<Client>(null as unknown as Client);
