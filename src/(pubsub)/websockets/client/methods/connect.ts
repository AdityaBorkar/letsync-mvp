import { ArkErrors } from "arktype"

import type { Context } from "@/core/client/config.js"

// import { CURSOR_KEY } from "../../../../core/client/constants.js"
import { Logger } from "../../../../utils/logger.js"
import { WsMessageSchema } from "../../utils/contract/client-rpc.js"
import { RequestStore } from "../../utils/request-store.js"
import type { ClientState } from "../index.js"
import { createWsContext } from "../utils/create-ws-context.js"

// import { cdcCache } from "../messages/cdc-cache.js"
// import { cdcRecords } from "../messages/cdc-records.js"

type ContextType = Omit<Context, "status" | "fetch">

const client_contract = {}

export function connect(props: {
  client: ClientState
  method: string
  wsUrl: string | undefined
  context: ContextType
}) {
  const logger = new Logger("SYNC:WS")

  const { client, method, wsUrl, context } = props
  const { controller } = context
  if (method !== "upgrade-to-ws") {
    throw new Error("Methods other than `upgrade-to-ws` are not supported yet!")
  }

  const ws = new window.WebSocket(wsUrl || "")
  const reqManager = RequestStore()

  controller.signal.addEventListener("abort", () => ws.close())
  ws.onopen = async () => {
    console.log("Websockets: Connected")
    client.set(ws)

    // <WebSocket, ContextType, ServerRpcMessage>
    const requestId = crypto.randomUUID()
    const ws_ctx = createWsContext({ context, reqManager, requestId, ws })

    // const ping = rpc.ping.get({})
    // ping.on(<name>, () => {})
    // const result = await ping.result

    const ping = await ws_ctx.rpc("ping")
    // @ts-expect-error
    const latency = Date.now() - ping.server_ts
    logger.log("Latency", { latency })

    // for await (const [_, database] of context.db.entries()) {
    //   const name = database.name
    //   const timestamp = (await database.metadata.get(CURSOR_KEY)) as string
    //   const cursor = timestamp ? new Date(timestamp).toString() : null
    //   wsContext.rpc("cdc", { cursor, name })
    // }

    // for await (const [_, filesystem] of fs.entries()) {
    //   const name = filesystem.name
    //   wsContext.rpc("cdc", { name })
    // }
  }
  ws.onmessage = ({ data: msg }) => {
    // Validation
    const msg_string = msg.toString()
    const message = WsMessageSchema(JSON.parse(msg_string))
    if (message instanceof ArkErrors) {
      logger.log("Invalid Message", { error: message.join("\n"), msg_string })
      throw new Error("Invalid Message")
    }

    const { type, requestId, payload } = message
    // if (type === "-- END --" || type === "-- STREAM --") {
    //   const request = RequestManager.get(requestId)
    //   if (!request) {
    //     console.error("Request not found", requestId)
    //   }
    //   request?.callback({ payload, requestId, type })
    //   return
    // }

    const handler = client_contract[type as keyof typeof client_contract]
    if (!handler) {
      console.error("Handler not found", type)
      throw new Error("Handler not found")
    }
    // @ts-expect-error
    handler(payload, createWsContext({ context, requestId, ws }))
  }
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
}
