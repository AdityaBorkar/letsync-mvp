import type { SQL_Schemas } from "./schemas.js";

export namespace ServerDB {
	export type Adapter<T> = {
		__brand: "LETSYNC_SERVER_DB";
		name: string;
		client: T;
		close: () => Promise<void>;
		connect: () => Promise<void>;
		schema: {
			list: (
				aboveVersion?: string,
				belowVersion?: string,
			) => Promise<SQL_Schemas.Schema[]>;
		};
	};
}

export namespace ServerFS {
	export type Adapter<T> = {
		__brand: "LETSYNC_SERVER_FS";
		name: string;
		filesystem: T;
	};
}

export namespace ServerPubSub {
	export type Adapter = {
		__brand: "LETSYNC_SERVER_PUBSUB";
		name: string;
		// pubsub: T;
		// syncData: (context: any) => Promise<void>;
		// secret: string;
		// publish: PublishFn;
		// subscribe: SubscribeFn;
		// authFn: (token: string) => Promise<{
		// 	subscribe: string[];
		// 	publish: string[];
		// }>;
	};

	export type Token = {
		value: string;
		expiresAt: number;
	};
}
