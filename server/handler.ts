import type { BunRequest, Server } from "bun";

import { getMigration } from "#letsync/server/endpoints/getMigration";
import { getSchema } from "#letsync/server/endpoints/getSchema";
import { getData_POLL } from "#letsync/server/endpoints/poll/route";
import { getData_SSE } from "#letsync/server/endpoints/sse/route";
import { getData_WS } from "#letsync/server/endpoints/web-sockets/route";

export function handler(request: BunRequest, server: Server) {
	const url = new URL(request.url);
	const path = url.pathname.split("/").pop() ?? "";

	if (path === "ws") {
		return getData_WS(request, server);
	}
	if (path === "sse") {
		return getData_SSE(request);
	}
	if (path === "poll") {
		return getData_POLL(request);
	}
	if (path === "schema") {
		return getSchema(request);
	}
	if (path === "migration") {
		return getMigration(request);
	}

	return new Response("Not Found", { status: 404 });
}
