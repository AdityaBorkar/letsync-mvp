import { type } from "arktype"

import type { WebsocketContext } from "../methods/connect.js"

const message = type({
  data: {
    cache: "object"
    //   database: [{ cursor: "string", name: "string" }, "[]"],
  },
  refId: "string",
  type: '"cdc-cache"'
})

function handler(
  _msg: (typeof message.infer)["data"],
  _context: WebsocketContext
) {
  // TODO: Handle cdc cache
}

export const cdcCache = { handler, message }
