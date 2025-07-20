import type { ClientDB, ClientFS } from "./client.js";
import type { PubSub } from "./pubsub.js";
import type { ServerDB, ServerFS } from "./server.js";

export type ApiHandlerAuth<R extends Request> = (
	request: R,
) =>
	| { userId: string; deviceId: string }
	| { message: string; status: 401 | 403 | 404 | 500 };

export type LetSyncConfig<R extends Request> = {
	apiBasePath?: string;
	auth: ApiHandlerAuth<R>;
	client: (ClientDB.Adapter<unknown> | ClientFS.Adapter<unknown>)[];
	pubsub: PubSub.Adapter<unknown>;
	server: (ServerDB.Adapter<unknown> | ServerFS.Adapter<unknown>)[];
};
