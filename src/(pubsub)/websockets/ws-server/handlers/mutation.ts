import type { WsHandlerType } from "../index.js"

export const mutation_get: WsHandlerType<"mutation"> = (payload, emit, ctx) => {
  console.log({ ctx, emit, payload })
}
