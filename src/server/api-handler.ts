import { ApiEndpoints } from "./api-endpoints.js";
import type { Context } from "./config.js";

export function apiHandler<R extends Request>(request: R, ctx: Context) {
	const url = new URL(request.url);
	const path = url.pathname.replace(
		ctx.apiUrl.path,
		"",
	) as keyof typeof ApiEndpoints;
	if (!(path in ApiEndpoints)) {
		return new Response("Not Found", { status: 404 });
	}

	const methods = ApiEndpoints[path];
	const method = request.method.toUpperCase() as keyof typeof methods;
	if (!(method in methods)) {
		return new Response("Not Found", { status: 404 });
	}

	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	const endpoint = methods[method] as Function;
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
