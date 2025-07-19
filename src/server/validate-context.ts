import type { ServerDB, ServerFS, ServerPubsub } from '../types/index.js';
import type { ApiHandlerAuth, ApiHandlerContext } from './api-handler.js';

export type ApiContext<R extends Request> = {
	basePath: string;
	auth: ApiHandlerAuth<R>;
	db: ServerDB.Adapter<unknown>[];
	fs: ServerFS.Adapter<unknown>[];
	pubsub: ServerPubsub.Adapter;
};

export function validateContext<R extends Request>(
	params: ApiContext<R>,
): ApiHandlerContext<R> {
	if (!params.auth) {
		throw new Error('Auth middleware is required');
	}

	const db = Array.isArray(params.db) ? params.db : [params.db];
	for (const database of db) {
		if (database.__brand !== 'LETSYNC_SERVER_DATABASE')
			throw new Error('Invalid database');
	}

	const fs = Array.isArray(params.fs) ? params.fs : [params.fs];
	for (const filesystem of fs) {
		if (filesystem.__brand !== 'LETSYNC_SERVER_FS')
			throw new Error('Invalid filesystem');
	}

	// TODO - WIP
	// if (!params.pubsub) {
	// 	throw new Error('Pubsub adapter is required');
	// }
	// if (pubsub.__brand !== 'LETSYNC_PUBSUB_BACKEND')
	// 	throw new Error('Invalid pubsub');

	return { ...params, db, fs };
}
