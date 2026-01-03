import type { Context } from "../config.ts"

export async function changesAdd(request: Request, _: Context) {
  const input = await request.json()
  console.log("changesAdd REQUEST RECEIVED WITH BODY: ", input)

  const response = {
    ack: true
  }
  return response
}
