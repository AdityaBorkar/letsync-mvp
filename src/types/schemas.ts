// biome-ignore-all lint/style/noNamespace: FOR INTERNAL USE ONLY
// biome-ignore lint/style/useNamingConvention: TEMPORARY
export namespace SQL_Schemas {
	export type Metadata = {
		key: string;
		type: "string" | "boolean" | "object";
		value: string;
	};

	export type Schema = {
		checksum: string;
		// biome-ignore lint/style/useNamingConvention: DATABASE FIELD NAME
		created_at: string;
		id: string;
		// biome-ignore lint/style/useNamingConvention: DATABASE FIELD NAME
		is_rolled_back: boolean;
		snapshot: string;
		sql: string;
		tag: string;
		version: number;
		// biome-ignore lint/style/useNamingConvention: DATABASE FIELD NAME
		applied_at: string;
	};
}
