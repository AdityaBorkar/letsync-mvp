import { apiHandler } from "@/core/server/api-handler.js"
import type { Config } from "@/core/server/index.js"

export function ApiServer({
  config,
  debug
}: {
  config: Config
  debug?: {
    prefix?: string
    color?: string
  }
}) {
  const context = { ...(debug || {}), ...config }
  const handler = (request: Request) => apiHandler(request, context)
  return { handler }
}
