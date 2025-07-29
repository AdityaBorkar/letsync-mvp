import type { ServerContext } from "./context.js";

export namespace ServerDB {
	export type Adapter<DT> = {
		__brand: "LETSYNC_SERVER_DB";
		name: string;
		client: DT;
		sql<R>(
			template: TemplateStringsArray | string,
			...args: unknown[]
		): Promise<{ affectedRows: number; rows: R[]; fields: unknown[] }>; // TODO: Write Types for `fields`
		// waitUntilReady: () => Promise<void>;
	};
}

export namespace ServerFS {
	export type Adapter<DT> = ServerFS<DT>;

	type ServerFS<DT> = {
		__brand: "LETSYNC_SERVER_FS";
		name: string;
		filesystem: DT;
	};
}

export namespace ServerPubSub {
	export type Adapter<T> = {
		__brand: "LETSYNC_PUBSUB_SERVER";
		name: string;
		pubsub: T;
		syncData: (context: ServerContext<Request>) => Promise<void>;
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
