// import type {
// 	ClientDB_Store_Metadata,
// 	ClientDB_Store_OfflineChanges,
// } from "@/types/client-store.js";
import type { LetSyncConfig } from "@/types/config.js";
import type { ClientDB, ClientFS, PubSub } from "@/types/index.js";

import { subscribe } from "./device/addEventListener.js";
import { deregister } from "./device/deregister.js";
import { flush } from "./device/flush.js";
import { live } from "./device/live.js";
import { pull } from "./device/pull.js";
import { push } from "./device/push.js";
import { reconcile } from "./device/reconcile.js";
import { register } from "./device/register.js";

export interface ClientParams {
	db: ClientDB.Adapter<unknown>[];
	fs: ClientFS.Adapter<unknown>[];
	pubsub: PubSub.Adapter<unknown>;
	config: LetSyncConfig<Request>;
	stores: {
		metadata: any; // ClientDB_Store_Metadata;
		offlineChanges: any; // ClientDB_Store_OfflineChanges;
	};
}

export async function createClient<
	DT extends ClientDB.Adapter<unknown>[],
	FS extends ClientFS.Adapter<unknown>[],
	PS extends PubSub.Adapter<unknown>,
>({
	db,
	fs,
	pubsub,
	config,
	// workers,
}: {
	db: DT;
	fs: FS;
	pubsub: PS;
	config: LetSyncConfig<Request>;
	// workers?: boolean;
}) {
	// TODO: Validate Parameters

	const stores = {
		metadata: metadataHandler({ config, db, fs }),
		offlineChanges: offlineChangesHandler({ config, db, fs }),
	};
	const params = { config, db, fs, pubsub, stores } satisfies ClientParams;

	const init = (props?: Parameters<typeof _init>[0]) => _init(props, params);

	const terminate = (props?: Parameters<typeof _terminate>[0]) =>
		_terminate(props, params);

	const device = {
		deregister: (props: Parameters<typeof deregister>[0]) =>
			deregister(props, params),
		flush: (props: Parameters<typeof flush>[0]) => flush(props, params),
		live: (props: Parameters<typeof live>[0]) => live(props, params),
		pull: (props: Parameters<typeof pull>[0]) => pull(props, params),
		push: (props: Parameters<typeof push>[0]) => push(props, params),
		reconcile: (props: Parameters<typeof reconcile>[0]) =>
			reconcile(props, params),
		register: (props: Parameters<typeof register>[0]) =>
			register(props, params),
	};

	const schema = {
		checkForUpdates: (props: Parameters<typeof checkForUpdates>[0]) =>
			checkForUpdates(props, params),
		migrate: (props: Parameters<typeof migrate>[0]) => migrate(props, params),
	};

	const addEventListener = (props: Parameters<typeof subscribe>[0]) =>
		subscribe(props, params);

	// TODO - isOnline, Cursor Position, Typing Indicator, Announce Device is online

	return { addEventListener, device, init, schema, terminate, ...params };
}
