import { ArkErrors } from "arktype"

import { Logger } from "../../../utils/logger.js"
import { dataCache } from "../server/messages/data-cache.js"
import { dataOperations } from "../server/messages/data-operations.js"
import { pong } from "../server/messages/pong.js"
import { generateRefId } from "./utils/generate-ref-id.js"

const MessageType = pong.message
  .or(dataOperations.message)
  .or(dataCache.message)

export function syncData(context: any) {
  const { apiUrl } = context
  const logger = new Logger("SYNC:WS")

  const ws = new window.WebSocket(
    `${apiUrl.https ? "wss" : "ws"}://${apiUrl.domain}/${apiUrl.path}/ws`
  )

  ws.onopen = () => {
    ws.send(JSON.stringify({ refId: generateRefId(), type: "ping" }))
    // for (const [name, database] of db.entries()) {
    // 	const metadata =
    // 		await database.sql<SQL_Schemas.Metadata>`SELECT * FROM client_metadata WHERE key="${name}:cursor"`;
    // 	const timestamp = rows[0]?.value;
    // 	const data = {
    // 		cursor: timestamp ? new Date(timestamp) : undefined,
    // 		name,
    // 		refId: generateRefId(),
    // 		type: "sync_request",
    // 	};
    // 	ws.send(JSON.stringify(data));
    // }
  }

  ws.onmessage = ({ data: message }) => {
    const data = MessageType(JSON.parse(message))
    if (data instanceof ArkErrors) {
      console.log({ data, message })
      logger.error("Invalid Message", data)
      return
    }

    if (data.type === "pong") {
      pong.handler(ws, data)
    } else if (data.type === "data_cache") {
      dataCache.handler(ws, data)
    } else if (data.type === "data_operations") {
      dataOperations.handler(ws, data)
    }
    // TODO: `mutation_ack`
  }

  ws.onerror = (error) => {
    logger.error("Connection Error", error)
    // TODO: Handle UNAUTHORIZED
    // TODO: Report Status
  }

  ws.onclose = () => {
    logger.log("Connection Closed")
    // TODO: Report Status
  }

  // signal.addEventListener("abort", () => ws.close());
}
