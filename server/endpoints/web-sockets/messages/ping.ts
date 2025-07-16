import { type } from "arktype";
import type { ServerWebSocket } from "bun";

import type { WebsocketData } from "#letsync/server/endpoints/web-sockets/wsHandler";
import type { PongMessage } from "./types";

const message = type({
	refId: "string",
	type: '"ping"',
});

export async function handler(
	ws: ServerWebSocket<WebsocketData>,
	msg: typeof message.infer,
) {
	const data = {
		refId: msg.refId,
		timestamp: Date.now(),
		type: "pong",
	} as typeof PongMessage.infer;
	ws.send(JSON.stringify(data));
}

export const ping = { handler, message };
