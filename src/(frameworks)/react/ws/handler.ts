import { ArkErrors } from "arktype";

import type { ClientDB } from "@/types/client.js";
import { Logger } from "@/utils/logger.js";

import { dataCache } from "./messages/data-cache.js";
import { dataOperations } from "./messages/data-operations.js";
import { pong } from "./messages/pong.js";
import { generateRefId } from "./utils.js";

const logger = new Logger("SYNC:WS");

const MessageType = pong.message
	.or(dataOperations.message)
	.or(dataCache.message);

export async function syncData_WS({
	// apiBasePath,
	signal,
	databases,
	server,
}: {
	apiBasePath: string;
	signal: AbortSignal;
	databases: Map<string, ClientDB.Adapter<unknown>>;
	server: {
		endpoint: string;
		https: boolean;
	};
}): Promise<void> {
	const ws = new window.WebSocket(
		`${server.https ? "wss" : "ws"}://${server.endpoint}/ws`,
	);

	ws.onopen = async () => {
		ws.send(JSON.stringify({ refId: generateRefId(), type: "ping" }));
		for (const [name, db] of databases.entries()) {
			const timestamp =
				// @ts-expect-error FIX THIS
				await db.sql`SELECT * FROM client_metadata WHERE key = ${name}:cursor`.then(
					// @ts-expect-error FIX THIS
					(result) => result.rows[0]?.value || "",
				);
			const data = {
				cursor: timestamp ? new Date(timestamp) : undefined,
				name,
				refId: generateRefId(),
				type: "sync_request",
			};
			ws.send(JSON.stringify(data));
		}
	};

	ws.onmessage = ({ data: message }) => {
		const data = MessageType(JSON.parse(message));
		if (data instanceof ArkErrors) {
			console.log({ data, message });
			logger.error("Invalid Message", data);
			return;
		}

		if (data.type === "pong") pong.handler(ws, data);
		if (data.type === "data_cache") dataCache.handler(ws, data);
		if (data.type === "data_operations") dataOperations.handler(ws, data);
		// mutation_ack
	};

	ws.onerror = (error) => {
		logger.error("Connection Error", error);
		// TODO: Handle UNAUTHORIZED
		// TODO: Report Status
	};

	ws.onclose = () => {
		logger.log("Connection Closed");
		// TODO: Report Status
	};

	signal.addEventListener("abort", () => {
		ws.close();
	});
}
