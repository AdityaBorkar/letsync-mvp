import type { Context } from "../config.js";

export async function SchemaUpgrade(
	props: { dbName: string; version: number | { latest: true } },
	context: Context,
) {
	const { dbName, version } = props;
	const db = context.db.get(dbName);
	if (!db) {
		throw new Error("Database not found");
	}

	const current_version = await db.metadata.get(`${db.name}:schema_version`);

	const schemas = await db.schema.list(
		String(current_version),
		String(version),
	);
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
