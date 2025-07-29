import type { ClientDB } from "@/types/client.js";
import type { SQL_Schemas } from "@/types/schemas.js";

export const schema = { insert, list, upsert };

async function insert(
	db: ClientDB.Adapter<unknown>,
	records: SQL_Schemas.Schema[],
) {
	for (const record of records) {
		await db.sql`INSERT INTO client_schemas (checksum, created_at, id, is_rolled_back, snapshot, sql, tag, version) VALUES (${record.checksum}, ${record.created_at}, ${record.id}, ${record.is_rolled_back}, ${record.snapshot}, ${record.sql}, ${record.tag}, ${record.version})`;
	}
}

async function list(db: ClientDB.Adapter<unknown>, aboveVersion?: string) {
	const schemas = await db.sql<SQL_Schemas.Schema>(
		`SELECT * FROM client_schemas WHERE name = ${db.name}` +
			(aboveVersion ? ` AND version > ${aboveVersion}` : "") +
			` ORDER BY version ASC`,
	);
	return schemas.rows;
}

async function upsert(
	db: ClientDB.Adapter<unknown>,
	record: SQL_Schemas.Schema,
) {
	await db.sql`INSERT INTO client_schemas (checksum, created_at, id, is_rolled_back, snapshot, sql, tag, version) VALUES (${record.checksum}, ${record.created_at}, ${record.id}, ${record.is_rolled_back}, ${record.snapshot}, ${record.sql}, ${record.tag}, ${record.version}) ON DUPLICATE KEY UPDATE version = ${record.version}`;
}
