import type { WsMessage_Schema } from "@/(pubsub)/websockets/utils/contract/helpers.js"

import type { WsCtx } from "../index.js"

export function ping_get(
  _data: WsMessage_Schema<"server.ping.get">["payload"],
  ctx: WsCtx
) {
  const server_ts = Date.now()
  // @ts-expect-error
  ctx.emit.result({ server_ts })
}
