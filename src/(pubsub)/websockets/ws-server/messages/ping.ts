import { type } from "arktype"

import type { WebsocketContext } from "../index.js"

const message = type({
  data: {},
  refId: "string",
  type: '"ping"'
})

export function handler(
  _msg: (typeof message.infer)["data"],
  context: WebsocketContext
) {
  const timestamp = Date.now()
  context.rpc("pong", { timestamp })
  context.end()
}

export const ping = { handler, message }
