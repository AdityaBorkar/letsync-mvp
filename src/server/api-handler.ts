import type { ServerDB } from '../../dist/types/index.js';
import type { HttpMethod } from '../constants.js';
import type { ServerFS, ServerPubsub } from '../types/index.js';
import { type EndpointContext, endpoints } from './endpoints.js';

export type ApiHandlerAuth<R extends Request> = (
	request: R,
) =>
	| { userId: string; deviceId: string }
	| { message: string; status: 401 | 403 | 404 | 500 };

export type ApiHandlerContext<R extends Request> = {
	basePath: string;
	auth: ApiHandlerAuth<R>;
	db: ServerDB.Adapter<unknown>[];
	fs: ServerFS.Adapter<unknown>[];
	pubsub: ServerPubsub.Adapter;
};

export function apiHandler<R extends Request>(
	request: R,
	ctx: ApiHandlerContext<R>,
) {
	const url = new URL(request.url);
	const path = url.pathname.replace(ctx.basePath, '') as keyof typeof endpoints;
	if (!(path in endpoints)) {
		return new Response('Not Found', { status: 404 });
	}

	const methods = endpoints[path];
	const method = request.method.toUpperCase() as HttpMethod;
	if (!(method in methods)) {
		return new Response('Not Found', { status: 404 });
	}

	// @ts-expect-error - TODO: Fix this
	const endpoint = methods[method];
	if (!endpoint) {
		return new Response('Not Found', { status: 404 });
	}

	const auth = ctx.auth(request);
	if ('status' in auth) {
		const { message, status } = auth;
		return new Response(message, { status });
	}

	const context: EndpointContext = { ...ctx, auth };
	return endpoint(request, context);
}
