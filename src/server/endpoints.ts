import type { ServerPubsub } from "@/types/pubsub.js";

import type { ServerDB, ServerFS } from "../types/index.js";
import cacheDelete from "./cache/delete.js";
import cacheRetrieve from "./cache/retrieve.js";
import cacheUpsert from "./cache/upsert.js";
import cdcCapture from "./db/cdc/capture.js";
import changesAdd from "./db/changes/add.js";
import changesGet from "./db/changes/get.js";
import changesStatus from "./db/changes/status.js";
import databaseInit from "./db/init/index.js";
import deviceRegister from "./device/register.js";
import deviceUnregister from "./device/unregister.js";
import { getMigration } from "./endpoints/getMigration.js";
import { getSchema } from "./endpoints/getSchema.js";
import { getData_SSE } from "./endpoints/sse/route.js";
import { getData_WS } from "./endpoints/web-sockets/route.js";

export type EndpointContext = {
	db: ServerDB.Adapter<unknown>[];
	fs: ServerFS.Adapter<unknown>[];
	pubsub: ServerPubsub.Adapter;
	auth: {
		userId: string;
		deviceId: string;
	};
};

export const endpoints = {
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
	"/db/init": {
		GET: databaseInit,
	},
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
	"/sse": {
		GET: getData_SSE,
	},
	"/ws": {
		GET: getData_WS,
	},
} as const;
