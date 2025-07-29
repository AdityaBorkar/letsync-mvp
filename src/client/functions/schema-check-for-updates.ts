import type { SQL_Schemas } from "@/types/schemas.js";
import type { Context } from "../config.js";
import { metadata } from "../utils/metadata.js";
import { schema } from "../utils/schema.js";

export async function SchemaCheckForUpdates(
	props: { dbName: string },
	context: Context,
) {
	const { dbName } = props;
	const db = context.db.get(dbName);
	if (!db) {
		throw new Error("Database not found");
	}

	const CurrentVersion = await metadata.get(db, `${db.name}:schema_version`);
	if (!CurrentVersion) {
		throw new Error("No version found");
	}

	const schemas = await context.fetch("GET", "/schema", {
		searchParams: { name: db.name, from: CurrentVersion },
	});
	if (schemas.error) {
		throw new Error(schemas.error.toString());
	}
	const _schemas = schemas.data as SQL_Schemas.Schema[];
	await schema.insert(db, _schemas);
}
