import type { ClientDB } from "@/types/client.js";

export async function getSchema(db: ClientDB.Adapter<unknown>, name: string) {
	const schema =
		await db.sql`SELECT * FROM client_metadata WHERE key=${`${name}:schema_version`} LIMIT 1`
			.then(
				// @ts-expect-error - result type from database adapter
				(result) => result.rows?.[0]?.value || null,
			)
			.catch((error: Error) => {
				if (
					error.cause
						?.toString()
						.endsWith('relation "client_metadata" does not exist')
				) {
					return null;
				}
				console.error("Error fetching schema", error);
				throw error.cause;
			});
	return schema;
}

export async function insertSchemas(
	db: ClientDB.Adapter<unknown>,
	schemas: unknown[],
) {
	for (const record of schemas) {
		// @ts-expect-error FIX THIS
		await db.sql`INSERT INTO client_schemas (checksum, created_at, id, is_rolled_back, snapshot, sql, tag, version) VALUES ("${record.checksum}", "${record.created_at}", "${record.id}", ${record.is_rolled_back}, "${record.snapshot}", "${record.sql}", "${record.tag}", ${record.version})`;
	}
}
