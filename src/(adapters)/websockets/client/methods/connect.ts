import type { Context } from "@/core/client/config/index.js"

import { CURSOR_KEY } from "../../../../core/client/constants.js"
// import { WsMessageSchema, type WsMessageType } from "../../utils/contract.js"
// import { CURSOR_KEY } from "../../../../core/client/constants.js"
import { Logger } from "../../../../utils/logger.js"
import { WsMessageSchema } from "../../utils/contract.js"
import { createWsHandlerContext } from "../../utils/ws-rpc-library/create-ws-context.js"
import { onMessage } from "../../utils/ws-rpc-library/on-message.js"
import { RequestStore } from "../../utils/ws-rpc-library/request-store.js"
import { handlers } from "../handlers/index.js"
import type { ClientState } from "../index.js"

export function connect(props: {
  client: ClientState
  wsUrl: string | undefined
  context: Omit<Context, "status" | "fetch">
}) {
  const logger = new Logger("SYNC:WS")

  const { client, context } = props
  const ws = new window.WebSocket(props.wsUrl || "")

  const ReqManager = RequestStore()
  const ws_ctx = {
    actor_env: "client",
    context,
    handlers,
    MsgSchema: WsMessageSchema,
    ReqManager,
    ws
  } as const
  const { ctx } = createWsHandlerContext(ws_ctx)

  context.controller.signal.addEventListener("abort", () => ws.close())
  ws.onerror = (error) => {
    logger.error("Websocket: Connection Error", error)
    // TODO: Handle UNAUTHORIZED
    // TODO: Report Status
  }
  ws.onclose = () => {
    logger.log("Websocket: Connection Closed")
    // TODO: Report Status
    client.set(null)
  }

  ws.onmessage = ({ data: msg }) => {
    onMessage(msg, ws_ctx)
  }
  ws.onopen = async () => {
    console.log("Websockets: Connected")
    client.set(ws)

    const ping = await ctx.rpc.ping(null).result
    const latency = Date.now() - ping.server_ts
    logger.log("Latency", { latency })

    for await (const [_, database] of context.db.entries()) {
      const name = database.name
      const timestamp = (await database.metadata.get(CURSOR_KEY)) as string
      const cursor = timestamp ? new Date(timestamp).toString() : null

      console.log({ cursor, name, timestamp })
      // const cdc = ws_ctx.rpc.cdc({ cursor, name })

      // const cacheIds = []
      // cdc.on("cache", (payload: unknown) => {
      //   console.log({ payload })
      //   cacheIds.push(payload.id)
      // })

      // const recordIds = []
      // cdc.on("records", (payload: unknown) => {
      //   console.log({ payload })
      //   recordIds.push(payload.id)
      // })

      // const result = await cdc.result
      // TODO: Reconcile if all records and caches are recieved and inserted

      const live = ctx.rpc.cdc({ cursor, name })
      live.on("stream", (payload: unknown) => {
        console.log("Message from Server: ", { payload })

        // live.ack(payload.id)  // TODO: ACKNOWLEDGE or else the record shall be re-sent after some time.

        // TODO: WRITE TO DATABASE
        // TODO: Update Cursor and Timestamp
      })
      // live.on("record_array", (payload: unknown) => {
      //   // TODO: ACKNOWLEDGE or else the record shall be re-sent after some time.
      //   // live.ack(payload.id)
      //   for (const record of payload.records) {
      //     // TODO: WRITE TO DATABASE
      //   }
      //   // TODO: Update Cursor and Timestamp
      // })
    }

    // for await (const [_, filesystem] of fs.entries()) {
    //   const name = filesystem.name
    //   wsContext.rpc("cdc", { name })
    // }
  }
}
