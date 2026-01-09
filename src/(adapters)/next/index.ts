import type { NextRequest } from "next/server.js"

import { apiHandler as apiHandlerCore } from "../../core/server/api-handler.js"
import type { ServerContext } from "../../core/server/index.js"

export function apiHandler({
  config,
  debug
}: {
  config: ServerContext
  debug?: {
    prefix?: string
    color?: string
  }
}) {
  const context = { ...(debug || {}), ...config }
  const handler = (request: NextRequest) => apiHandlerCore(request, context)
  return { GET: handler, POST: handler }
}
