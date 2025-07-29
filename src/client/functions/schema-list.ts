import type { SQL_Schemas } from "@/types/schemas.js";

import type { Context } from "../config.js";

export async function SchemaList(
	props: {
		dbName: string;
		filterByUpgrade: boolean;
	},
	context: Context,
) {
	const { dbName, filterByUpgrade } = props;

	const data: SQL_Schemas.Schema[] = [];

	const db = context.db.get(dbName);
	if (!db) {
		return { data: undefined, error: "No database found." };
	}

	const CurrentVersion = await db.metadata.get(`${db.name}:schema_version`);
	if (!CurrentVersion) {
		return { data: undefined, error: "No version found." };
	}

	const aboveVersion = filterByUpgrade ? String(CurrentVersion) : undefined;
	const list = await db.schema.list(aboveVersion);
	data.push(...list);

	return { data, error: undefined };
}
