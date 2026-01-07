import type { Context } from "@/core/client/config.js"

// import { CURSOR_KEY } from "../../../../core/client/constants.js"
import { Logger } from "../../../../utils/logger.js"
// import { WsMessageSchema, type WsMessageType } from "../../utils/contract.js"
import { RequestStore } from "../../utils/request-store.js"
import { createWsHandlerContext } from "../../utils/ws-rpc-library/create-ws-context.js"
import { onMessage } from "../../utils/ws-rpc-library/on-message.js"
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

  const reqManager = RequestStore()
  const ctx = {
    actor_env: "client",
    context,
    handlers,
    reqManager,
    ws
  } as const
  const ws_ctx = createWsHandlerContext(ctx)

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
    onMessage(msg, ctx)
  }
  ws.onopen = async () => {
    console.log("Websockets: Connected")
    client.set(ws)

    const ping = await ws_ctx.rpc.ping(null)
    const latency = Date.now() - ping.server_ts
    logger.log("Latency", { latency })

    // for await (const [_, database] of context.db.entries()) {
    //   const name = database.name
    //   const timestamp = (await database.metadata.get(CURSOR_KEY)) as string
    //   const cursor = timestamp ? new Date(timestamp).toString() : null
    //   const cdc = ws_ctx.rpc("cdc", { cursor, name })

    //   const cacheIds = []
    //   cdc.on("cache", (data) => {
    //     console.log({ data })
    //     cacheIds.push(data.id)
    //   })

    //   const recordIds = []
    //   cdc.on("records", (data) => {
    //     console.log({ data })
    //     recordIds.push(data.id)
    //   })

    //   const result = await cdc.result
    //   // TODO: Reconcile if all records and caches are recieved and inserted

    //   const live = ws_ctx.rpc("live", { cursor, name })
    //   live.on("record", (data) => {
    //     recordIds.push(data.id)
    //     // TODO: ACKNOWLEDGE or else the record shall be re-sent after some time.
    //     // TODO: Plan about what to do about the missing records.
    //   })
    // }

    // for await (const [_, filesystem] of fs.entries()) {
    //   const name = filesystem.name
    //   wsContext.rpc("cdc", { name })
    // }
  }
}
