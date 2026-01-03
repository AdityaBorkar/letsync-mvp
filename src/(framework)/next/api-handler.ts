import type { NextRequest } from "next/server.js"

import { LetsyncServer } from "../../index.ts"

export function apiHandler(config: Parameters<typeof LetsyncServer>[0]) {
  const { apiHandler } = LetsyncServer(config)
  const handler = (request: NextRequest) => apiHandler(request)
  return { GET: handler, POST: handler }
}
