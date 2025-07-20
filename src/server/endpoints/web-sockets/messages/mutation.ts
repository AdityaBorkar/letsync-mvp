import type { ServerWebSocket } from "bun";

import { type } from "arktype";

import type { WebsocketData } from "../../../ws-handler.js";

const message = type({
	database: [{ cursor: "string", name: "string" }, "[]"],
	refId: "string",
	type: '"mutation"',
});

export async function handler(
	ws: ServerWebSocket<WebsocketData>,
	msg: typeof message.infer,
) {
	const { userId, tenantId } = ws.data;

	// TODO: Validate mutation message
	// TODO: RPC execute mutation method
	console.log("Mutation from user", userId, "tenant", tenantId, msg);

	// TODO: [ack] mutation result
	// TODO: [publish] mutation result
}

export const mutation = { handler, message };
