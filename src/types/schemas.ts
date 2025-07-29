export namespace SQL_Schemas {
	export type Metadata = {
		key: string;
		type: "string" | "boolean" | "object";
		value: string;
	};

	export type Schema = {
		checksum: string;
		created_at: string;
		id: string;
		is_rolled_back: boolean;
		snapshot: string;
		sql: string;
		tag: string;
		version: number;
		applied_at: string;
	};
}
