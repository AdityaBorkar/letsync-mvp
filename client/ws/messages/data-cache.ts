import { type } from "arktype";

const message = type({
	cache: "object",
	refId: "string",
	type: '"data_cache"',
});

function handler(_ws: WebSocket, _msg: typeof message.infer) {
	// TODO: Handle data cache
}

export const dataCache = { handler, message };
