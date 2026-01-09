import { API_ENDPOINTS } from "./api-endpoints.js"
import { Context, type ContextType } from "./utils/context.js"
import { logger } from "./utils/logger.js"

export async function apiHandler<R extends Request>(
  request: R,
  ctx: ContextType
) {
  Context.enterWith(ctx)
  const context = Context.getStore()
  if (!context) {
    logger.error("Context not found")
    return Response.json({ message: "Internal Server Error" }, { status: 500 })
  }

  const url = new URL(request.url)
  const path = url.pathname as keyof typeof API_ENDPOINTS
  if (!(path in API_ENDPOINTS)) {
    return // Response.json({ message: "Not Found" }, { status: 404 })
  }

  const methods = API_ENDPOINTS[path]
  const method = request.method.toUpperCase() as keyof typeof methods
  if (!(method in methods)) {
    return // Response.json({ message: "Not Found" }, { status: 404 })
  }

  // biome-ignore lint/complexity/noBannedTypes: TEMPORARY
  const endpoint = methods[method] as Function
  if (!endpoint) {
    return // Response.json({ message: "Not Found" }, { status: 404 })
  }

  // TODO: Build Time Generated (Pendering) for non-OTA
  // TODO: ISR for OTA
  // TODO: Remove the Authentication once ISR is implemented

  const auth = await ctx.auth(request)
  if ("status" in auth) {
    const { message, status } = auth
    return Response.json({ message }, { status })
  }

  return endpoint(request)
}
