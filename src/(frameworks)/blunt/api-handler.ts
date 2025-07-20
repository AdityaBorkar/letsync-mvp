import type { BunRequest } from "bun";

import {
	type ApiContext,
	apiHandler,
	validateContext,
} from "../../server/index.js";

export function createApiHandler(params: ApiContext<BunRequest>) {
	const context = validateContext(params);
	return (request: BunRequest) => apiHandler(request, context);
}
