import type {
	ApiHandlerAuth,
	ServerContext,
	ServerDB,
	ServerFS,
	ServerPubSub,
} from "@/types/index.js";

export type Server = ReturnType<typeof LetSyncServer>;

export type Context = {
	db: Map<string, ServerDB.Adapter<unknown>>;
	fs: Map<string, ServerFS.Adapter<unknown>>;
	pubsub: Map<string, ServerPubSub.Adapter<unknown>>;
};

export type LetSyncConfig<R extends Request> = {
	apiUrl: { path: string; domain: string; https: boolean };
	auth: ApiHandlerAuth<R>;
	connections: (
		| ServerPubSub.Adapter<unknown>
		| ServerDB.Adapter<unknown>
		| ServerFS.Adapter<unknown>
	)[];
};

export function LetSyncServer<R extends Request>(config: LetSyncConfig<R>) {
	if (typeof window !== "undefined" || typeof process === "undefined") {
		throw new Error("LetSync can only be used in the server");
	}

	// * Adapters
	const db: Map<string, ServerDB.Adapter<unknown>> = new Map();
	const fs: Map<string, ServerFS.Adapter<unknown>> = new Map();
	const pubsub: Map<string, ServerPubSub.Adapter<unknown>> = new Map();
	for (const item of config.connections) {
		if (item.__brand === `LETSYNC_SERVER_DB`) {
			db.set(item.name, item);
			continue;
		}
		if (item.__brand === `LETSYNC_SERVER_FS`) {
			fs.set(item.name, item);
			continue;
		}
		if (item.__brand === `LETSYNC_PUBSUB_SERVER`) {
			pubsub.set(item.name, item);
			continue;
		}
		throw new Error("Invalid adapter type");
	}
	if (fs.size === 0 && db.size === 0) {
		throw new Error("No database or filesystem configured");
	}
	if (pubsub.size === 0) {
		throw new Error("No pubsub configured");
	}

	// ! --------------------------------------------------------------

	const apiUrl = config.apiUrl || {
		path: "/api/sync",
		domain: "localhost",
		https: false,
	};

	if (!config.auth) {
		// TODO - Auth Provider check
		throw new Error("Auth middleware is required");
	}
	const { auth } = config;

	// TODO: OLDER API:
	// stores: { metadata, offlineChanges }
	// device: { deregister, flush, live, pull, push, reconcile, register }
	// init, terminate, checkForUpdates, migrate
	// TODO - isOnline, Cursor Position, Typing Indicator, Announce Device is online

	return {
		addEventListener,
		apiUrl,
		auth,
		db,
		env: "SERVER",
		fs,
		// isOnline,
		// isSyncing,
		// isDbRunning,
		// isFsRunning,
	} as ServerContext<R>;
}
