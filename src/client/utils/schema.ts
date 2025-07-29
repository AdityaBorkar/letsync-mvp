import type { ClientDB } from "@/types/client.js";
import type { SQL_Schemas } from "@/types/schemas.js";
import { tryCatch } from "@/utils/try-catch.js";

export async function getSchema(db: ClientDB.Adapter<unknown>) {
	const { error, data } = await tryCatch(
		db.sql<SQL_Schemas.Metadata>`SELECT * FROM client_metadata WHERE key=${`${db.name}:schema_version`} LIMIT 1`,
	);
	if (error) {
		if (
			error.cause
				?.toString()
				.endsWith('relation "client_metadata" does not exist')
		) {
			return null;
		}
		console.error("Error fetching schema", error);
		throw error.cause;
	}
	return data.rows[0]?.value || null;
}

export async function insertSchemas(
	db: ClientDB.Adapter<unknown>,
	schemas: {
		checksum: string;
		created_at: string;
		id: string;
		is_rolled_back: boolean;
		snapshot: string;
		sql: string;
		tag: string;
		version: string;
	}[],
) {
	for (const record of schemas) {
		await db.sql`INSERT INTO client_schemas (checksum, created_at, id, is_rolled_back, snapshot, sql, tag, version) VALUES ("${record.checksum}", "${record.created_at}", "${record.id}", ${record.is_rolled_back}, "${record.snapshot}", "${record.sql}", "${record.tag}", ${record.version})`;
	}
}
