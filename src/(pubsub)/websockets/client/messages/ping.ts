import type { ServerWebSocket } from "bun";

import { type } from "arktype";

import type { WebsocketData } from "../../server/handler.js";
import type { PongMessage } from "../../server/messages/types.js";

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
