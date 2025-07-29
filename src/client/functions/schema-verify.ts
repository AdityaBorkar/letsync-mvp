import type { Context } from "../config.js";

export async function SchemaVerify(
	props: { dbName: string },
	context: Context,
) {
	const { dbName } = props;

	const db = context.db.get(dbName);
	if (!db) {
		throw new Error("Database not found");
	}

	const CurrentVersion = await db.metadata.get(`${db.name}:schema_version`);
	const schema = await db.schema.pull();
	console.log({ schema, CurrentVersion });
	// TODO: Send a FetchRequest to verify the schema for the relevant version
}
