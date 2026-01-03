import type { Context } from "../config.js"

export async function cacheDelete(request: Request, _: Context) {
  const input = await request.json()
  console.log("cacheDelete REQUEST RECEIVED WITH BODY: ", input)

  const response = { ack: true }
  return response
}
