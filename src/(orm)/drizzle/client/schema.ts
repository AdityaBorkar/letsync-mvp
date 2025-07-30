import type { SQL_Schemas } from "@/types/schemas.js";

import { sql } from "./sql.js";
import type { DrizzleClientDb } from "./types.js";

export const schema = { apply, insert, list, pull };

export async function pull(db: DrizzleClientDb) {
	return await sql(
		db,
		`SELECT table_name, string_agg(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position) as columns
        FROM information_schema.columns
        WHERE table_schema = 'public'
        GROUP BY table_name
        ORDER BY table_name;`,
	);
}

async function insert(db: DrizzleClientDb, records: SQL_Schemas.Schema[]) {
	for (const record of records) {
		await sql(
			db,
			`INSERT INTO client_schemas (checksum, created_at, id, is_rolled_back, snapshot, sql, tag, version) VALUES (${record.checksum}, ${record.created_at}, ${record.id}, ${record.is_rolled_back}, ${record.snapshot}, ${record.sql}, ${record.tag}, ${record.version})`,
		);
	}
}

async function list(
	db: DrizzleClientDb,
	aboveVersion?: string,
	belowVersion?: string,
) {
	const schemas = await sql(
		db,
		"SELECT * FROM client_schemas" +
			(aboveVersion ? ` WHERE version > ${aboveVersion}` : "") +
			(belowVersion ? ` AND version <= ${belowVersion}` : "") +
			" ORDER BY version ASC",
	);
	// @ts-expect-error - TODO: Fix this
	return schemas.rows;
}

async function apply(db: DrizzleClientDb, record: SQL_Schemas.Schema) {
	await sql(
		db,
		`INSERT INTO client_schemas (checksum, created_at, id, is_rolled_back, snapshot, sql, tag, version) VALUES (${record.checksum}, ${record.created_at}, ${record.id}, ${record.is_rolled_back}, ${record.snapshot}, ${record.sql}, ${record.tag}, ${record.version}) ON DUPLICATE KEY UPDATE version = ${record.version}`,
	);

	// const applied_at = new Date().toISOString();
	// await db.schema.apply({ ..._schema, applied_at });

	// export async function executeSQL(db: ClientDB.Adapter<unknown>, sql: string) {
	// 	const commands: string[] = sql.split("--> statement-breakpoint");
	// 	const errors: string[] = [];
	// 	for await (const command of commands) {
	// 		try {
	// 			await db.sql(command);
	// 		} catch (err: unknown) {
	// 			errors.push(err instanceof Error ? err.toString() : String(err));
	// 		}
	// 	}
	// 	if (errors.length > 0) {
	// 		console.error("Schema Execution Failed", errors);
	// 		throw new Error("Schema Execution Failed");
	// 	}
	// }
}
