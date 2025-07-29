import type { SQL_Schemas } from "@/types/schemas.js";
import type { Context } from "../config.js";
import { metadata } from "../utils/metadata.js";

export async function SchemaUpgrade(
	props: { dbName: string; version: number | { latest: true } },
	context: Context,
) {
	const { dbName, version } = props;
	const db = context.db.get(dbName);
	if (!db) {
		throw new Error("Database not found");
	}

	const current_version = await metadata.get(db, `${db.name}:schema_version`);

	let sql = `SELECT * FROM client_schemas`;
	if (current_version) {
		sql += ` WHERE version > ${current_version}`;
		sql += typeof version === "string" ? ` AND version <= ${version}` : "";
	}
	sql += " ORDER BY created_at ASC";

	const { rows: schemas } = await db.sql<SQL_Schemas.Schema>(sql);
	if (schemas.length === 0) {
		console.log("No updates found");
		return;
	}

	for (const schema of schemas) {
		// TODO: GET MIGRATION SQL
		// TODO: executeSQL()
		console.log({ schema });
		// await executeSchema(db, schema.sql);
		// await db.sql`INSERT INTO client_metadata (key, value) VALUES ("${db.name}:schema_version", ${schema.version})`;
	}
}
