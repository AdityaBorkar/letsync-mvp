import type { ClientDB, ClientFS } from "@/types/client.js";
import type { LetSyncConfig } from "@/types/config.js";
import type { LetSyncContext } from "@/types/context.js";

export function LetSync_ServerConfig<R extends Request>(
	config: LetSyncConfig<R>,
) {
	const isClient = typeof window !== "undefined";
	if (!isClient) {
		throw new Error("LetSync can only be used in the client");
	}

	const api = config.api || {
		basePath: "/api/sync",
		domain: "localhost",
		https: false,
	};

	if (!config.auth) {
		// TODO - Auth Provider check
		throw new Error("Auth middleware is required");
	}
	const { auth } = config;

	const db: Map<string, ClientDB.Adapter<unknown>> = new Map();
	const fs: Map<string, ClientFS.Adapter<unknown>> = new Map();
	for (const item of config.client) {
		if (item.__brand === `LETSYNC_CLIENT_DB`) {
			db.set(item.name, item);
			continue;
		}
		if (item.__brand === `LETSYNC_CLIENT_FS`) {
			fs.set(item.name, item);
			continue;
		}
		throw new Error("Invalid adapter type");
	}

	// TODO - Pubsub check
	// if (!params.pubsub) {
	// 	throw new Error('Pubsub adapter is required');
	// }
	// if (pubsub.__brand !== 'LETSYNC_PUBSUB_BACKEND')
	// 	throw new Error('Invalid pubsub');

	// const mutation = new MutationBuilder(config);

	// TODO: Implement Events
	const addEventListener = () => {};

	// TODO: OLDER API:
	// stores: { metadata, offlineChanges }
	// device: { deregister, flush, live, pull, push, reconcile, register }
	// init, terminate, checkForUpdates, migrate
	// TODO - isOnline, Cursor Position, Typing Indicator, Announce Device is online

	return {
		addEventListener,
		api,
		auth,
		db,
		env: "CLIENT",
		fs,
		// isOnline,
		// isSyncing,
		// isDbRunning,
		// isFsRunning,
	} as LetSyncContext<R>;
}
