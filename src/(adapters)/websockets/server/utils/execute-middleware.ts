import type { ServerMiddlewareFn } from "../../index.js"
import type { HttpServer } from "../index.js"

export async function executeMiddleware({
  middleware,
  request,
  server,
  path
}: {
  middleware: Record<string, ServerMiddlewareFn[]>
  request: Request
  server: HttpServer
  path: string
}) {
  let ctx = {}
  const fnArray = middleware[path] // TODO: REPLACE WITH GLOB MATCHING
  if (!fnArray) return
  for await (const fn of fnArray) {
    ctx = await fn({ ctx, request, server })
  }
  return ctx
}
