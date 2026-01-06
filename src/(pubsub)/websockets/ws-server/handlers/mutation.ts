import type { MutationPayload } from "../../utils/contract/server-rpc.js"
import type { WsCtx } from "../index.js"

export function mutation_get(data: MutationPayload, ctx: WsCtx) {
  // ctx.emit.event("ack")
  console.log({ ctx, data })

  // TODO: Validate mutation message
  // ctx.emit.event("failed")

  // TODO: RPC execute mutation method
  // ctx.emit.event("failed")

  // ctx.emit.event("success")
}
