import { apiHandler } from "@/core/server/api-handler.js"
import type { LetsyncConfig } from "@/core/server/config/index.js"

export function ApiServer({
  config,
  debug
}: {
  config: LetsyncConfig
  debug?: {
    prefix?: string
    color?: string
  }
}) {
  const context = { ...(debug || {}), ...config }
  const handler = (request: Request) => apiHandler(request, context)
  return { handler }
}
