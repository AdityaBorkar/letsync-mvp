import type { SQL_Schemas } from "./schemas.js";

export type GenericObject = { [key: string]: string | boolean | GenericObject };

export namespace ClientDB {
	export type Adapter<T> = {
		__brand: "LETSYNC_CLIENT_DB";
		client: T;
		name: string;
		connect: () => Promise<void>;
		close: () => Promise<void>;
		metadata: {
			get: (key: string) => Promise<string | boolean | GenericObject | null>;
			set: (
				key: string,
				value: string | boolean | GenericObject,
			) => Promise<void>;
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
		size: () => Promise<number>;
		dump: (options: {
			compression: "none" | "gzip" | "auto";
		}) => Promise<File | Blob>;
	};
}

export namespace ClientPubSub {
	export type Adapter = {
		__brand: "LETSYNC_CLIENT_PUBSUB";
		name: string;
		// syncData: (context: any) => Promise<void>;
		close: () => Promise<void>;
	};
}

export namespace ClientFS {
	export type Adapter<RT> = {
		__brand: "LETSYNC_CLIENT_FS";
		name: string;
		filesystem: RT;
		init: () => Promise<void>;
		close: () => Promise<void>;
	};
}
