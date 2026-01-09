import { apiHandler } from "../../core/server/api-handler.js"
import type { ServerContext } from "../../core/server/index.js"

export function ApiServer({
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
  const handler = (request: Request) => apiHandler(request, context)
  return { handler }
}
