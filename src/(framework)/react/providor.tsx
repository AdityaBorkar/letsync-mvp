// biome-ignore lint/style/useImportType: REACT
import React from "react"

import type { Client } from "@/core/client/config.js"

import { Context } from "./context.js"

export function LetsyncProvider({
  client,
  children
}: {
  client: Client
  children: React.ReactNode
}) {
  return <Context value={client}>{children}</Context>
}
