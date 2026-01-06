import type { PingPayload } from "../../utils/contract/server-rpc.js"
import type { WsCtx } from "../index.js"

export function ping_get(_data: PingPayload, ctx: WsCtx) {
  const server_ts = Date.now()
  ctx.emit.result({ server_ts })
}
