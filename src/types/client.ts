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
		db: T;
		name: string;
		// open: () => Promise<void>;
		// close: () => Promise<void>;
		// flush: () => Promise<void>;
		// buildSchema: (schema: null) => Promise<void>;
		// sql: any;
		// exportData: (options: {
		// 	compression: "none" | "gzip" | "auto";
		// }) => Promise<File | Blob>;
		// storageMetrics: () => void;
	};
}
