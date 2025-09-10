import type { Server, ServerWebSocket } from "bun"

import { ArkErrors } from "arktype"

import {
  type Context,
  type LetsyncConfig,
  LetsyncServer
} from "../../../server/config.js"
import { Logger } from "../../../utils/logger.js"
import type { ClientRpcMessage } from "../client/schemas.js"
import type { WebsocketData } from "../types.js"
import { createWsContext } from "../utils/create-ws-context.js"
import { RequestStore } from "../utils/request-store.js"
import { ping } from "./messages/ping.js"
import { syncRequest } from "./messages/sync-request.js"
import { type ServerRpcMessage, ServerRpcSchema } from "./schemas.js"

export type Websocket = ServerWebSocket<WebsocketData>

type ContextType = Omit<Context, "status" | "fetch">

export type WsContext = ReturnType<
  typeof createWsContext<WebSocket, ContextType, ClientRpcMessage>
>

export async function WebsocketServer(config: LetsyncConfig<Request>) {
  const { context } = LetsyncServer(config)
  const logger = new Logger(`[${"INSERT-NAME-HERE"}]`)

  const database = context.db.get("postgres")
  if (!database) {
    throw new Error("Database not found")
  }
  const ABC = await database.syncInitialize("wal")
  console.log({ ABC })

  // TODO: Add Listeners to Databases (Idempotent)
  // TODO: WAL and store writes in CDC
  // TODO: Run seeding script to test logic.

  // await db.query("START_REPLICATION SLOT letsync_slot LOGICAL 0/0")
  // this.pg.on('copyData', (chunk) => {
  //   this.processWALMessage(chunk.toString('utf8'))
  // })

  // private async processWALMessage(message: string) {
  //   try {
  //     const changes = JSON.parse(message)

  //     for (const change of changes.change || []) {
  //       await this.processSingleChange(change)
  //     }
  //   } catch (error) {
  //     console.error('WAL processing error:', error)
  //   }
  // }

  // private async processSingleChange(change: any) {
  //   const { kind, schema, table, columnnames, columnvalues, oldkeys } = change

  //   // Skip letsync schema changes to avoid recursion
  //   if (schema === 'letsync') return

  //   const cdcRecord = {
  //     id: crypto.randomUUID(),
  //     action: kind, // 'insert', 'update', 'delete'
  //     timestamp: new Date(),
  //     user_id: this.extractUserId(change), // Extract from row data
  //     transformations: {
  //       schema,
  //       table,
  //       columnnames,
  //       columnvalues,
  //       oldkeys
  //     }
  //   }

  //   // Store in CDC table
  //   await this.storeCDCRecord(cdcRecord)

  //   // Publish to relevant websocket connections
  //   await this.publishToClients(cdcRecord)
  // }

  // private async storeCDCRecord(record: any) {
  //   await this.pg.query(`
  //     INSERT INTO letsync.cdc_record (id, action, timestamp, user_id, transformations)
  //     VALUES ($1, $2, $3, $4, $5)
  //   `, [record.id, record.action, record.timestamp, record.user_id, JSON.stringify(record.transformations)])
  // }

  // private async publishToClients(record: any) {
  //   const userId = record.user_id
  //   const wsContext = this.wsConnections.get(userId)

  //   if (wsContext) {
  //     wsContext.stream({
  //       type: 'cdc-records',
  //       data: {
  //         name: 'default', // or extract from schema/table
  //         records: [{
  //           id: record.id,
  //           operation: record.action,
  //           tenantId: userId,
  //           createdAt: record.timestamp.toISOString(),
  //           updatedAt: record.timestamp.toISOString()
  //         }]
  //       }
  //     })
  //   }
  // }

  // private extractUserId(change: any): string {
  //   // Extract user_id from the changed row data
  //   const userIdIndex = change.columnnames?.indexOf('user_id')
  //   return userIdIndex >= 0 ? change.columnvalues[userIdIndex] : 'unknown'
  // }

  const apiHandler = (request: Request, server: Server) => {
    const result = context.auth(request)
    if ("status" in result) {
      return Response.json(result, { status: result.status })
    }

    const { userId, deviceId } = result
    const connectionTime = Date.now()
    const upgraded = server.upgrade(request, {
      data: { connectionTime, deviceId, userId }
    })
    if (!upgraded) {
      return Response.json(
        { error: "Failed to upgrade to WebSocket" },
        { status: 400 }
      )
    }
    return
  }

  const RequestManager = RequestStore()

  const wsHandler = {
    close(ws: Websocket) {
      const { userId } = ws.data
      logger.log(`Connection closed for user: ${userId}`)
    },
    message(ws: Websocket, msg: string) {
      const message = ServerRpcSchema(JSON.parse(msg))
      if (message instanceof ArkErrors) {
        console.log({ message, msg })
        throw new Error("Invalid message format")
      }
      const { type, data, requestId, chunkId } = message
      const wsContext = createWsContext<
        Websocket,
        ContextType,
        ServerRpcMessage
      >({ context, RequestManager, requestId, ws })

      if (chunkId) {
        const request = RequestManager.get(requestId)
        if (!request) {
          logger.error("Request not found", requestId)
        }
        request?.callback(message)
      } else if (type === "ping") {
        ping.handler(data, wsContext)
      } else if (type === "sync-request") {
        syncRequest.handler(data, wsContext)
      }
    },
    open(ws: Websocket) {
      const { userId } = ws.data
      console.log(`WebSocket opened for user: ${userId}`)
    }
  }

  return { apiHandler, wsHandler }
}
