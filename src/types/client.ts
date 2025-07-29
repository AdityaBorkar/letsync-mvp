import type { ClientContext } from "./context.js";
import type { SQL_Schemas } from "./schemas.js";

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
		// sql<R>(
		// 	template: TemplateStringsArray | string,
		// 	...args: unknown[]
		// ): Promise<{ affectedRows: number; rows: R[]; fields: unknown[] }>; // TODO: Write Types for `fields`
		start: () => Promise<void>;
		close: () => Promise<void>;
		metadata: {
			get: (key: string) => Promise<string | boolean | Object | null>;
			set: (key: string, value: string | boolean | Object) => Promise<void>;
			remove: (key: string) => Promise<void>;
		};
		flush: () => Promise<void>;
		schema: {
			pull: () => Promise<unknown>; // TODO: Define the type
			insert: (records: SQL_Schemas.Schema[]) => Promise<void>;
			list: (
				aboveVersion?: string,
				belowVersion?: string,
			) => Promise<SQL_Schemas.Schema[]>;
			apply: (record: SQL_Schemas.Schema) => Promise<void>;
		};
		// schema: {
		// 	insert: (records: SQL_Schemas.Schema[]) => Promise<void>;
		// 	list: (aboveVersion?: string) => Promise<SQL_Schemas.Schema[]>;
		// 	upsert: (record: SQL_Schemas.Schema) => Promise<void>;
		// };
		size: () => Promise<number>;
		dump: (options: {
			compression?: "none" | "gzip" | "auto";
		}) => Promise<File | Blob>;
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
