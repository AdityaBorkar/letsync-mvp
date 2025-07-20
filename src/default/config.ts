import type { ClientDB, ClientFS } from "@/types/client.js";
import type { LetSyncConfig } from "@/types/config.js";
import type { LetSyncContext } from "@/types/context.js";
import type { ServerDB, ServerFS } from "@/types/server.js";

export function LetSync<R extends Request>(config: LetSyncConfig<R>) {
	const env = typeof window !== "undefined" ? "CLIENT" : "SERVER";
	const env_lowercase = env.toLowerCase() as "client" | "server";
	const apiBasePath = config.apiBasePath || "/api/sync";

	if (!config.auth) {
		throw new Error("Auth middleware is required");
	}

	const db:
		| Map<string, ClientDB.Adapter<unknown>>
		| Map<string, ServerDB.Adapter<unknown>> = new Map();
	const fs:
		| Map<string, ClientFS.Adapter<unknown>>
		| Map<string, ServerFS.Adapter<unknown>> = new Map();

	const assets = config[env_lowercase];
	for (const item of assets) {
		if (item.__brand === `LETSYNC_${env}_DB`) {
			// @ts-expect-error
			db.set(item.name, item);
			continue;
		}
		if (item.__brand === `LETSYNC_${env}_FS`) {
			// @ts-expect-error
			fs.set(item.name, item);
			continue;
		}
		throw new Error("Invalid adapter type");
	}

	// TODO - WIP
	// if (!params.pubsub) {
	// 	throw new Error('Pubsub adapter is required');
	// }
	// if (pubsub.__brand !== 'LETSYNC_PUBSUB_BACKEND')
	// 	throw new Error('Invalid pubsub');

	// const mutation = new MutationBuilder(config);

	return { apiBasePath, auth: config.auth, db, env, fs } as LetSyncContext<R>;
}
