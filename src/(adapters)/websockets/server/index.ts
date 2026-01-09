import type { Server, ServerWebSocket, WebSocketHandler } from "bun"

import type { ingestHelperFn } from "@/types/index.js"

import type { ServerContext } from "../../../core/server/config.js"
import { onMessage } from "../library-ws-rpc/on-message.js"
import { RequestStore } from "../library-ws-rpc/request-store.js"
import type {
  $Extract_WsMethodNames,
  WsHandlerType
} from "../library-ws-rpc/type-helpers.js"
import { WsMessageSchema, type WsMessageType } from "../utils/contract.js"
import { handlers } from "./handlers/index.js"
import { Context } from "./utils/context.js"
import { logger } from "./utils/logger.js"

type WsData = {
  reqManager: ReturnType<typeof RequestStore>
  userId: string
  deviceId: string
  connectionTime: number
  topics: string[]
  system_callbacks: ((message: string) => void)[]
}

export type WsHandler<
  M extends $Extract_WsMethodNames<"client", WsMessageType["type"]>
> = WsHandlerType<
  WsMessageType,
  M,
  ServerContext & { ws: ServerWebSocket<WsData> }
>

export async function WsServer(props: {
  context: ServerContext
  debug?: {
    prefix?: string
    color?: string
  }
  ingest: ingestHelperFn
}) {
  const { context, debug, ingest } = props
  Context.enterWith({ ...context, ...(debug || {}) })

  const db = context.db.values().next().value
  // context.db.size === 1
  //   ? context.db.values().next().value
  //   : context.db.get(context.shadowDbName || "") // TODO: HARDCODE
  if (!db) {
    throw new Error("Database not found")
  }
  await db?.connect()

  let ingestCounter = 0
  async function ingestHandler(props: {
    request: Request
    body: string
    server: Server<WsData>
  }) {
    const { body, server } = props
    const result = await ingest(body)
    if (!result.success) {
      return Response.json({ error: result.error }, { status: 500 })
    }

    // TODO: Figure out how to reject repetitive entries
    // Use idempotent operations to handle duplicates
    // Implement backpressure in streaming to prevent overload
    // Hole Detection (Missing Events)
    // Out-of-Order Delivery

    // TODO: [BATCH ALL REQUESTS IN 1 SECOND]
    console.log({ result })
    for (const cdc of result.cdc_records) {
      // TODO: Write to DB CDC
      // const result = await db.cdc.insert(cdc)
      // if (!result) {
      //   throw new Error("Failed to write to database")
      // }

      const message = {
        messageId: null,
        payload: cdc,
        requestId: null,
        type: "server-system.live.stream"
      }
      console.log({ message })
      server.publish(cdc.table_name, `SYSTEM_SERVER:${JSON.stringify(message)}`) // TODO: Propagate to all subscribers
    }

    ingestCounter += result.cdc_records.length
    if (ingestCounter > 100) {
      // TODO: CREATE CACHE FOR THE CDC RECORDS
      // db.cdc_cache.getLatest()
      // db.cdc.get({ from: timestamp, limit: 100 })
      // db.cdc_cache.insert()
    }

    return Response.json({ success: true })
    // TODO: For more deterministic behaviour, make this function a transaction with the Mutation Request, Request fails if this function fails.
  }

  async function dataHandler(props: {
    request: Request
    server: Server<WsData>
  }) {
    const { request, server } = props
    const result = await context.auth(request)
    if ("status" in result) {
      const { message, status } = result
      return Response.json({ message }, { status })
    }

    const topics = [
      // TODO: DO NOT HARDCODE
      "poc_replication.public.transactions",
      "poc_replication.public.accounts"
    ]
    const data = {
      connectionTime: Date.now(),
      reqManager: RequestStore(),
      system_callbacks: [],
      topics,
      ...result
    }
    const upgraded = server.upgrade(request, { data })
    if (!upgraded) {
      Response.json(
        { error: "Failed to upgrade to WebSocket" },
        { status: 400 }
      )
    }
    return
  }

  const wsHandler: WebSocketHandler<WsData> = {
    close(ws, code, reason) {
      const { userId, deviceId } = ws.data
      const duration = Date.now() - ws.data.connectionTime
      const data = { code, deviceId, duration, reason, userId }
      logger.log("WebSocket closed", data)
    },
    idleTimeout: 60 * 15, // 15 minutes
    message(ws, msg) {
      if (msg.toString().startsWith("SYSTEM_CLIENT:")) {
        console.log("Possible Bug: ", { msg })
        return
      }
      if (msg.toString().startsWith("SYSTEM_SERVER:")) {
        console.log("SYSTEM_SERVER: ", { msg })
        const message = JSON.parse(msg.toString().slice(14))
        for (const callback of ws.data.system_callbacks) {
          console.log("SYSTEM_SERVER: ", { message })
          callback(message)
        }
        return
      }
      onMessage(msg, {
        actor_env: "server",
        context: { ...context, ws },
        handlers,
        MsgSchema: WsMessageSchema,
        ReqManager: ws.data.reqManager,
        ws
      })
    },
    open(ws) {
      const { userId, deviceId } = ws.data
      const data = { deviceId, userId }
      logger.log("WebSocket opened", data)
      // TODO: Propagate as the user is ONLINE
    }
  }

  return { dataHandler, ingestHandler, wsHandler }
}
