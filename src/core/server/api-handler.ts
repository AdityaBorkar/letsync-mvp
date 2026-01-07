import { ApiEndpoints } from "./api-endpoints.js"
import type { Context } from "./config.js"

export async function apiHandler<R extends Request>(request: R, ctx: Context) {
  const url = new URL(request.url)
  const path = url.pathname as keyof typeof ApiEndpoints
  if (!(path in ApiEndpoints)) {
    return Response.json({ message: "Not Found" }, { status: 404 })
  }

  const methods = ApiEndpoints[path]
  const method = request.method.toUpperCase() as keyof typeof methods
  if (!(method in methods)) {
    return Response.json({ message: "Not Found" }, { status: 404 })
  }

  // biome-ignore lint/complexity/noBannedTypes: TEMPORARY
  const endpoint = methods[method] as Function
  if (!endpoint) {
    return Response.json({ message: "Not Found" }, { status: 404 })
  }

  const auth = await ctx.auth(request)
  if ("status" in auth) {
    const { message, status } = auth
    return Response.json({ message }, { status })
  }

  return endpoint(request, ctx)
}
