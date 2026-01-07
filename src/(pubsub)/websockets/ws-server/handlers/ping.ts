import type { WsHandler } from "../index.js"

export const ping_get: WsHandler<"ping"> = (_payload, emit) => {
  const server_ts = Date.now()
  emit.result({ server_ts })
}
