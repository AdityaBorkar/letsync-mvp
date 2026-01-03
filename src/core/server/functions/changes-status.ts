import type { Context } from "../config.ts"

export async function changesStatus(request: Request, _: Context) {
  const input = await request.json()
  console.log("changesStatus REQUEST RECEIVED WITH BODY: ", input)

  const response = {
    ack: true
  }
  return response
}
