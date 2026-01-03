import type { Context } from "../config.js"

export async function changesGet(request: Request, _: Context) {
  const input = await request.json()
  console.log("changesGet REQUEST RECEIVED WITH BODY: ", input)

  const response = {
    ack: true
  }
  return response
}
