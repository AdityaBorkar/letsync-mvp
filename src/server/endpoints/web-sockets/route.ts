import type { BunRequest, Server } from "bun";

import type { LetSyncContext } from "@/types/context.js";

export async function getData_WS(
	request: BunRequest,
	_: LetSyncContext<Request>,
	server: Server,
) {
	// Upgrade connection to WebSocket with authenticated user data
	const connectionTime = Date.now();
	const upgraded = server.upgrade(request, {
		data: { connectionTime },
	});
	if (upgraded) return undefined;
	return Response.json(
		{ error: "Failed to upgrade to WebSocket" },
		{ status: 400 },
	);
}
