import type { ClientDB, ClientFS, ClientPubSub } from "@/types/client.js";
import type { ApiHandlerAuth } from "@/types/context.js";
import { FetchClient } from "@/utils/fetch-client.js";

import { Signal } from "../utils/signal.js";
// import { DataExport } from "./functions/data-export.js";
// import { DataFlush } from "./functions/data-flush.js";
// import { DataPull } from "./functions/data-pull.js";
// import { DataPush } from "./functions/data-push.js";
// import { DataReset } from "./functions/data-reset.js";
// import { DataSize } from "./functions/data-size.js";
// import { DataSync } from "./functions/data-sync.js";
// import { DataVerify } from "./functions/data-verify.js";
// import { DeviceDeregister } from "./functions/device-deregister.js";
// import { DeviceRegister } from "./functions/device-register.js";
import { EventManager } from "./functions/event-manager.js";
import { SchemaCheckForUpdates } from "./functions/schema-check-for-updates.js";
import { SchemaList } from "./functions/schema-list.js";
import { SchemaUpgrade } from "./functions/schema-upgrade.js";
import { SchemaVerify } from "./functions/schema-verify.js";
import { SyncStart } from "./functions/sync-start.js";
import { SyncTerminate } from "./functions/sync-terminate.js";

export type Client = ReturnType<typeof LetSyncClient>;

export type Context = {
	db: Map<string, ClientDB.Adapter<unknown>>;
	fs: Map<string, ClientFS.Adapter<unknown>>;
	pubsub: Map<string, ClientPubSub.Adapter>;
	controller: AbortController;
	status: {
		isDbRunning: Signal<boolean>;
		isFsRunning: Signal<boolean>;
		isSyncing: Signal<boolean>;
		isOnline: Signal<boolean>;
	};
	fetch: ReturnType<typeof FetchClient>;
};

export type LetSyncConfig<R extends Request> = {
	apiUrl: { path: string; domain: string; https: boolean };
	auth: ApiHandlerAuth<R>;
	connections: (
		| ClientPubSub.Adapter
		| ClientDB.Adapter<unknown>
		| ClientFS.Adapter<unknown>
	)[];
};

export function LetSyncClient(config: LetSyncConfig<Request>) {
	if (typeof window === "undefined") {
		throw new Error("LetSync can only be used in the client");
	}

	// * Adapters
	const db = new Map<string, ClientDB.Adapter<unknown>>();
	const fs = new Map<string, ClientFS.Adapter<unknown>>();
	const pubsub = new Map<string, ClientPubSub.Adapter>();
	for (const item of config.connections) {
		if (item.__brand === `LETSYNC_CLIENT_DB`) {
			db.set(item.name, item);
			continue;
		}
		if (item.__brand === `LETSYNC_CLIENT_FS`) {
			fs.set(item.name, item);
			continue;
		}
		if (item.__brand === `LETSYNC_CLIENT_PUBSUB`) {
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

	// TODO - Auth Provider check
	// if (!config.auth) {
	// 	throw new Error("Auth middleware is required");
	// }

	// * Utils
	const GARBAGE_COLLECTOR: (() => void)[] = [];
	const controller = new AbortController();
	const fetch = FetchClient(config.apiUrl);

	// * Event Manager
	const { subscribe } = EventManager();
	// * Status

	const isOnline = new Signal(false);
	const isSyncing = new Signal(false);
	const isDbRunning = new Signal(false);
	const isFsRunning = new Signal(false);
	const getStatus = () => ({
		isDbRunning: isDbRunning.get(),
		isFsRunning: isFsRunning.get(),
		isOnline: isOnline.get(),
		isSyncing: isSyncing.get(),
	});

	// * Online Check
	const handleOnline = () => isOnline.set(true);
	const handleOffline = () => isOnline.set(false);
	window.addEventListener("online", handleOnline);
	window.addEventListener("offline", handleOffline);
	GARBAGE_COLLECTOR.push(() => {
		window.removeEventListener("online", handleOnline);
		window.removeEventListener("offline", handleOffline);
	});

	// * Context
	const status = { isDbRunning, isFsRunning, isOnline, isSyncing };
	const context: Context = { controller, db, fetch, fs, pubsub, status };

	// * Primitive Functions
	const data = {
		// sync: (_: Parameters<typeof DataSync>[0]) => DataSync(_, context),
		// export: (_: Parameters<typeof DataExport>[0]) => DataExport(_, context),
		// flush: (_: Parameters<typeof DataFlush>[0]) => DataFlush(_, context),
		// pull: (_: Parameters<typeof DataPull>[0]) => DataPull(_, context),
		// push: (_: Parameters<typeof DataPush>[0]) => DataPush(_, context),
		// reset: (_: Parameters<typeof DataReset>[0]) => DataReset(_, context),
		// verify: (_: Parameters<typeof DataVerify>[0]) => DataVerify(_, context),
		// size: (_: Parameters<typeof DataSize>[0]) => DataSize(_, context),
	};
	const schema = {
		checkForUpdates: (_: Parameters<typeof SchemaCheckForUpdates>[0]) =>
			SchemaCheckForUpdates(_, context),
		list: (_: Parameters<typeof SchemaList>[0]) => SchemaList(_, context),
		upgrade: (_: Parameters<typeof SchemaUpgrade>[0]) =>
			SchemaUpgrade(_, context),
		verify: (_: Parameters<typeof SchemaVerify>[0]) => SchemaVerify(_, context),
	};

	// * Compound Functions
	const sync = {
		start: (
			_: Parameters<typeof SyncStart>[0] = {
				autoUpgrade: true,
				checkForUpdates: true,
			},
		) => SyncStart(_, context),
		terminate: () => SyncTerminate(undefined, context),
	};

	return { data, db, fs, getStatus, pubsub, schema, subscribe, sync };
}
