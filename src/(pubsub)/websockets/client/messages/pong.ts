import { type } from "arktype"

import type { WebsocketContext } from "../methods/connect.js"

export const message = type({
  data: {
    timestamp: "number"
  },
  refId: "string",
  type: '"pong"'
})

function handler(
  data: (typeof message.infer)["data"],
  _context: WebsocketContext
) {
  const totalLatency = Date.now() - data.timestamp
  console.log(`Total Latency: ${totalLatency}ms`)
}

export const pong = { handler, message }
