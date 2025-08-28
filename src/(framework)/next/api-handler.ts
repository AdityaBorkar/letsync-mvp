import type { NextRequest } from "next/server.js"

import { LetSyncServer } from "@/index.js"

export function apiHandler(config: Parameters<typeof LetSyncServer>[0]) {
  const { apiHandler } = LetSyncServer(config)
  const handler = (request: NextRequest) => apiHandler(request)
  return { GET: handler, POST: handler }
}
