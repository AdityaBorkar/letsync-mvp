import type { ClientPubSub, ServerPubSub } from "./~pubsub.js";
import type { ClientDB, ClientFS } from "./client.js";
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
	pubsub: ClientPubSub.Adapter<unknown> | ServerPubSub.Adapter<unknown>;
	server: (ServerDB.Adapter<unknown> | ServerFS.Adapter<unknown>)[];
};
