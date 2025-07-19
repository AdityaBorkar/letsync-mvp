import type { NextRequest } from 'next/server.js';

import {
	type ApiContext,
	apiHandler,
	validateContext,
} from '../../server/index.js';

export function createApiHandler(params: ApiContext<NextRequest>) {
	const context = validateContext(params);
	return (request: NextRequest) => apiHandler(request, context);
}
