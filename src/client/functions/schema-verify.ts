import type { Context } from "../config.js";
import { metadata } from "../utils/metadata.js";

export async function SchemaVerify(
	props: { dbName: string },
	context: Context,
) {
	const { dbName } = props;

	const db = context.db.get(dbName);
	if (!db) {
		throw new Error("Database not found");
	}

	const CurrentVersion = await metadata.get(db, `${db.name}:schema_version`);

	const columns = await db.sql<{
		column_name: string;
		data_type: string;
	}>(
		`SELECT table_name, string_agg(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position) as columns
        FROM information_schema.columns
        WHERE table_schema = 'public'
        GROUP BY table_name
        ORDER BY table_name;`,
	);

	console.log({ columns, CurrentVersion });

	// TODO: Send a FetchRequest to verify the schema for the relevant version
}
