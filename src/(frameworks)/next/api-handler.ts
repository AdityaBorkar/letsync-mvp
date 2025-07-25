// import type { NextRequest } from "next/server.js";

import { apiHandler as API_HANDLER } from "@/server/index.js";
import type { LetSyncContext } from "@/types/context.js";

type NextRequest = Request;

export function apiHandler(context: LetSyncContext<NextRequest>) {
	const handler = (request: NextRequest) => API_HANDLER(request, context);
	return { GET: handler, POST: handler };
}
