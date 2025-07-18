import type { BunRequest, Server } from "bun";

import { auth } from "@/lib/auth/config"; // TODO: Outsource auth to a separate module

export async function getData_WS(request: BunRequest, server: Server) {
	const headers = request.headers;
	const session = await auth.api.getSession({ headers });
	const userId = session?.user?.id;
	if (!userId) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Upgrade connection to WebSocket with authenticated user data
	const connectionTime = Date.now();
	const upgraded = server.upgrade(request, {
		data: { connectionTime, session, userId },
	});
	if (upgraded) return undefined;
	return Response.json(
		{ error: "Failed to upgrade to WebSocket" },
		{ status: 400 },
	);
}
