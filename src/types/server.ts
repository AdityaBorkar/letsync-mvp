export namespace ServerDB {
	export type Adapter<DT> = {
		__brand: "LETSYNC_SERVER_DB";
		name: string;
		client: DT;
		sql: (
			template: TemplateStringsArray,
			...args: unknown[]
		) => Promise<unknown>;
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
