// biome-ignore lint/style/useImportType: REACT
import React from "react"

import { Client, type Config } from "../../../core/client/config.ts"
import { SyncContext } from "./context.ts"

export function LetsyncClient(config: Config<Request>) {
  const client = Client(config)

  // biome-ignore lint/correctness/noNestedComponentDefinitions: IGNORE FOR NOW
  function Provider({ children }: { children: React.ReactNode }) {
    return <SyncContext value={client}>{children}</SyncContext>
  }

  return { client, Provider }
}
