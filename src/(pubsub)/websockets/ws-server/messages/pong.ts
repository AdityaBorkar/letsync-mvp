import { type } from "arktype"

import { getContextByRefId } from "../../client/utils/context.js"

export const message = type({
  refId: "string",
  timestamp: "number",
  type: '"pong"'
})

function handler(_: WebSocket, data: typeof message.infer) {
  const request = getContextByRefId(data.refId)
  if (!request) {
    throw new Error("Request not found")
  }

  const totalLatency = Date.now() - request.timestamp
  console.log(`Total Latency: ${totalLatency}ms`)
  // const serverLatency = data.timestamp - request.timestamp;
  // console.log(`Server Latency: ${serverLatency}ms`);
}

export const pong = { handler, message }
