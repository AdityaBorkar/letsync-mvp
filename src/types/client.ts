export namespace ClientFS {
	export type Adapter<RT> = {
		__brand: "LETSYNC_CLIENT_FS";
		name: string;
		filesystem: RT;
		init: () => Promise<void>;
	};
}

export namespace ClientDB {
	export type Adapter<T> = {
		__brand: "LETSYNC_CLIENT_DB";
		client: T;
		name: string;
		sql<R extends unknown[]>(
			template: TemplateStringsArray,
			...args: unknown[]
		): Promise<R>;
	};
}
