import type { ClientContext } from "./context.js";

export namespace ClientFS {
	export type Adapter<RT> = {
		__brand: "LETSYNC_CLIENT_FS";
		name: string;
		filesystem: RT;
		init: () => Promise<void>;
		close: () => Promise<void>;
	};
}

export namespace ClientDB {
	export type Adapter<T> = {
		__brand: "LETSYNC_CLIENT_DB";
		client: T;
		name: string;
		sql<R>(
			template: TemplateStringsArray,
			...args: unknown[]
		): Promise<{ affectedRows: number; rows: R[]; fields: unknown[] }>; // TODO: Write Types for `fields`
		close: () => Promise<void>;
	};
}

export namespace ClientPubSub {
	export type Adapter<T> = {
		__brand: "LETSYNC_PUBSUB_CLIENT";
		name: string;
		pubsub: T;
		syncData: (context: ClientContext<Request>) => Promise<void>;
		close: () => Promise<void>;
	};

	export type SyncMethod =
		| "sse"
		| "websocket"
		| "webtransport"
		| "http-long-polling"
		| "http-short-polling";
}
