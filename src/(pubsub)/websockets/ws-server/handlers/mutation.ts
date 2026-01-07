import type { WsMessage_Schema } from "@/(pubsub)/websockets/utils/ws-rpc-library/type-helpers.js"

import type { WsCtx } from "../index.js"

export function mutation_get(
  data: WsMessage_Schema<"server.mutation.get">["payload"],
  ctx: WsCtx
) {
  // ctx.emit.event("ack")
  console.log({ ctx, data })

  // TODO: Validate mutation message
  // ctx.emit.event("failed")

  // TODO: RPC execute mutation method
  // ctx.emit.event("failed")

  // ctx.emit.event("success")
}
