import type { ClientDB, ClientFS } from "./client.js";
import type { ServerDB, ServerFS } from "./server.js";

export type ApiHandlerAuth<R extends Request> = (
	request: R,
) =>
	| { userId: string; deviceId: string }
	| { message: string; status: 401 | 403 | 404 | 500 };

// export type LetSyncContext<R extends Request> =
// 	| LetSyncContextClient<R>
// 	| LetSyncContextServer<R>;

export type ClientContext<R extends Request> = {
	apiUrl: { path: string; domain: string; https: boolean };
	auth: ApiHandlerAuth<R>;
	env: "CLIENT";
	db: Map<string, ClientDB.Adapter<unknown>>;
	fs: Map<string, ClientFS.Adapter<unknown>>;
	addEventListener: () => void;
};

export type ServerContext<R extends Request> = {
	apiUrl: { path: string; domain: string; https: boolean };
	auth: ApiHandlerAuth<R>;
	env: "SERVER";
	db: Map<string, ServerDB.Adapter<unknown>>;
	fs: Map<string, ServerFS.Adapter<unknown>>;
};
