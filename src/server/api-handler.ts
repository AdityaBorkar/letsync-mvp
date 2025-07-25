import type { LetSyncContext } from "@/types/context.js";

import type { HttpMethod } from "../utils/constants.js";
import { ApiEndpoints } from "./api-endpoints.js";

export function apiHandler<R extends Request>(
	request: R,
	ctx: LetSyncContext<R>,
) {
	const url = new URL(request.url);
	const path = url.pathname.replace(ctx.api, "") as keyof typeof ApiEndpoints;
	if (!(path in ApiEndpoints)) {
		return new Response("Not Found", { status: 404 });
	}

	const methods = ApiEndpoints[path];
	const method = request.method.toUpperCase() as HttpMethod;
	if (!(method in methods)) {
		return new Response("Not Found", { status: 404 });
	}

	// @ts-expect-error - TODO: Fix this
	const endpoint = methods[method];
	if (!endpoint) {
		return new Response("Not Found", { status: 404 });
	}

	const auth = ctx.auth(request);
	if ("status" in auth) {
		const { message, status } = auth;
		return new Response(message, { status });
	}

	return endpoint(request, ctx);
}
