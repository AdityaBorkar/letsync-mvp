export namespace ServerDB {
	export type Adapter<DT> = SqlServerDb<DT> | NoSqlServerDb<DT>;

	type ServerDb<DT> = {
		__brand: "LETSYNC_SERVER_DB";
		name: string;
		db: DT;
		// waitUntilReady: () => Promise<void>;
	};

	type SqlServerDb<DT> = ServerDb<DT> & {
		// type: "SQL";
		// query: (query: string) => Promise<unknown>;
	};

	type NoSqlServerDb<DT> = ServerDb<DT> & {
		// type: "NOSQL";
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
