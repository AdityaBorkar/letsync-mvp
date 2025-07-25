import type { ClientDB_Store_OfflineChanges } from "@/types/client-store.js";
import type { LetSyncConfig } from "@/types/config.js";
import type { ClientDB, ClientFS } from "@/types/index.js";

interface Params {
	db: ClientDB.Adapter<unknown>[];
	fs: ClientFS.Adapter<unknown>[];
	config: LetSyncConfig<Request>;
}

export function offlineChangesHandler(
	params: Params,
): ClientDB_Store_OfflineChanges {
	console.log({ params });
	// const { db, fs, config } = params;

	return {
		// @ts-expect-error - TODO
		get: async (key: string) => {},
		// @ts-expect-error - TODO
		remove: async (key: string) => {},
		// @ts-expect-error - TODO
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		upsert: async (key: string, content: { [key: string]: any }) => {},
	};
}
