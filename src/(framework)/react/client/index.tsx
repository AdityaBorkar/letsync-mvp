// biome-ignore lint/style/useImportType: REACT
import React from "react"

import { Client, type Config } from "../../../client/config.js"
import { SyncContext } from "./context.js"

export function LetsyncClient(config: Config<Request>) {
  const client = Client(config)

  // biome-ignore lint/correctness/noNestedComponentDefinitions: IGNORE FOR NOW
  function Provider({ children }: { children: React.ReactNode }) {
    return <SyncContext value={client}>{children}</SyncContext>
  }

  return { client, Provider }
}
