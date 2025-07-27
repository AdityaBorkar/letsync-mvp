import type { ClientDB, ClientFS } from "./client.js";
import type { ApiHandlerAuth } from "./config.js";
import type { ServerDB, ServerFS } from "./server.js";

export type LetSyncContext<R extends Request> =
	| LetSyncContextClient<R>
	| LetSyncContextServer<R>;

export type LetSyncContextClient<R extends Request> = {
	api: { basePath: string; domain: string; https: boolean };
	auth: ApiHandlerAuth<R>;
	env: "CLIENT";
	db: Map<string, ClientDB.Adapter<unknown>>;
	fs: Map<string, ClientFS.Adapter<unknown>>;
	addEventListener: () => void;
};

export type LetSyncContextServer<R extends Request> = {
	api: { basePath: string; domain: string; https: boolean };
	auth: ApiHandlerAuth<R>;
	env: "SERVER";
	db: Map<string, ServerDB.Adapter<unknown>>;
	fs: Map<string, ServerFS.Adapter<unknown>>;
};
