import type { Context } from "../config.ts"

export async function cacheRetrieve(request: Request, _: Context) {
  const input = await request.json()
  console.log("cacheRetrieve REQUEST RECEIVED WITH BODY: ", request)
  console.log("cacheRetrieve REQUEST RECEIVED WITH BODY: ", input)

  const response = {
    ack: true
  }
  return response
}
