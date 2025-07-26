import type { ServerPubSub } from "@/types/~pubsub.js";

import type { ServerDB, ServerFS } from "../types/index.js";
import cacheDelete from "./functions/cache-delete.js";
import cacheRetrieve from "./functions/cache-retrieve.js";
import cacheUpsert from "./functions/cache-upsert.js";
import cdcCapture from "./functions/cdc-capture.js";
import changesAdd from "./functions/changes-add.js";
import changesGet from "./functions/changes-get.js";
import changesStatus from "./functions/changes-status.js";
import deviceRegister from "./functions/device-register.js";
import deviceUnregister from "./functions/device-unregister.js";
import { getSchema } from "./functions/schema-list.js";
import { getMigration } from "./functions/schema-migration.js";

export type EndpointContext = {
	db: ServerDB.Adapter<unknown>[];
	fs: ServerFS.Adapter<unknown>[];
	pubsub: ServerPubSub.Adapter<unknown>;
	auth: {
		userId: string;
		deviceId: string;
	};
};

export const ApiEndpoints = {
	"/cache": {
		DELETE: cacheDelete,
		GET: cacheRetrieve,
		POST: cacheUpsert,
	},
	"/db/cdc": {
		POST: cdcCapture,
	},
	"/db/changes": {
		GET: changesGet, // getData_POLL(request);
		POST: changesAdd,
	},
	"/db/changes/status": {
		GET: changesStatus,
	},
	// "/db/init": {
	// 	GET: databaseInit,
	// },
	"/device": {
		DELETE: deviceUnregister,
		POST: deviceRegister,
	},
	"/schema": {
		GET: getSchema,
	},
	"/schema/migration": {
		GET: getMigration,
	},
} as const;
