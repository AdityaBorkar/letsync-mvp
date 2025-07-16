import { ArkErrors } from "arktype";
import type { ServerWebSocket } from "bun";

import { mutation } from "#letsync/server/endpoints/web-sockets/messages/mutation";
import { ping } from "#letsync/server/endpoints/web-sockets/messages/ping";
import { syncRequest } from "#letsync/server/endpoints/web-sockets/messages/syncRequest";
import type { Session } from "@/lib/auth/config";

export interface WebsocketData {
	userId: string;
	session: Session;
	connectionTime: number;
}

const MessageType = syncRequest.message.or(mutation.message).or(ping.message);

export const wsHandler = {
	// close(ws: ServerWebSocket<WebsocketData>) {
	// 	const { userId } = ws.data;
	// 	console.log(`WebSocket closed for user: ${userId}`);
	// },
	async message(ws: ServerWebSocket<WebsocketData>, message: string) {
		const data = MessageType(JSON.parse(message));
		if (data instanceof ArkErrors) {
			console.log({ data, message });
			throw new Error("Invalid message format");
		}

		// TODO: Use AsyncLocalStorage for `ws` and `data`
		if (data.type === "ping") await ping.handler(ws, data);
		if (data.type === "mutation") await mutation.handler(ws, data);
		if (data.type === "sync_request") await syncRequest.handler(ws, data);
	},
	// async open(ws: ServerWebSocket<WebsocketData>) {
	// 	const { userId } = ws.data;
	// },
};
