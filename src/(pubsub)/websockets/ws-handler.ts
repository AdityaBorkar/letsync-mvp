import type { ServerWebSocket } from "bun";

import { ArkErrors } from "arktype";

import type { LetSyncContext } from "@/types/context.js";

import { mutation } from "../../server/endpoints/web-sockets/messages/mutation.js";
import { ping } from "../../server/endpoints/web-sockets/messages/ping.js";
import { syncRequest } from "../../server/endpoints/web-sockets/messages/syncRequest.js";

export interface WebsocketData {
	userId: string;
	connectionTime: number;
}

const MessageType = syncRequest.message.or(mutation.message).or(ping.message);

export const wsHandler = {
	// close(ws: ServerWebSocket<WebsocketData>) {
	// 	const { userId } = ws.data;
	// 	console.log(`WebSocket closed for user: ${userId}`);
	// },
	async message(
		ws: ServerWebSocket<WebsocketData>,
		message: string,
		context: LetSyncContext<Request>,
	) {
		const data = MessageType(JSON.parse(message));
		if (data instanceof ArkErrors) {
			console.log({ data, message });
			throw new Error("Invalid message format");
		}

		// TODO: Use AsyncLocalStorage for `ws` and `data`
		if (data.type === "ping") await ping.handler(ws, data);
		if (data.type === "mutation") await mutation.handler(ws, data);
		if (data.type === "sync_request")
			await syncRequest.handler(ws, data, context);
	},
	// async open(ws: ServerWebSocket<WebsocketData>) {
	// 	const { userId } = ws.data;
	// },
};
