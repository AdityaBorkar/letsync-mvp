// biome-ignore lint/style/useImportType: REACT
import React from "react"

import type { ClientConfig } from "@/core/client/config/index.js"

import { Context } from "./context.js"

export function LetsyncProvider({
  client,
  children
}: {
  client: ClientConfig
  children: React.ReactNode
}) {
  return <Context value={client}>{children}</Context>
}
