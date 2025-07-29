import type { NextRequest } from "next/server.js";

import { apiHandler as API_HANDLER } from "@/index.js";
import type { ServerContext } from "@/types/context.js";

export function apiHandler(context: ServerContext<NextRequest>) {
	const handler = (request: NextRequest) => API_HANDLER(request, context);
	return { GET: handler, POST: handler };
}
