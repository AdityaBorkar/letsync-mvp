// biome-ignore lint/style/useImportType: REACT
import React from "react"

import type { Client } from "@/core/client/config.ts"

import { Context } from "./context.ts"

export function LetsyncProvider({
  client,
  children
}: {
  client: Client
  children: React.ReactNode
}) {
  return <Context value={client}>{children}</Context>
}
