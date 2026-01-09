import type { NextRequest } from "next/server.js"

import { apiHandler as apiHandlerCore } from "@/core/server/api-handler.js"

import type { ServerConfig } from "../../index.js"

export function apiHandler({
  config,
  debug
}: {
  config: // TODO: Type Definition
  debug?: {
    prefix?: string
    color?: string
  }
}) {
  const context = { ...(debug || {}), ...config }
  const handler = (request: NextRequest) => apiHandlerCore(request, context)
  return { GET: handler, POST: handler }
}
