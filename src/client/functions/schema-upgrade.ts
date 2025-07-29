import type { SQL_Schemas } from "@/types/schemas.js";
import type { Context } from "../config.js";
import { getSchema } from "../utils/schema.js";

export async function SchemaUpgrade(
	props: string | { latest: true },
	context: Context,
) {
	console.log({ props, context });
	// TODO - (WRITE LOCK) ENABLE
	// TODO - PUSH WRITE REQUESTS
	// TODO - COLLECT ERRORS (DO NOT DO ANYTHING WITH THEM FOR NOW)
	// TODO - (WRITE LOCK) RELEASE

	for (const [, db] of context.db.entries()) {
		const version =
			typeof props === "string" ? props : "TODO: GET LATEST VERSION";

		const current_version = await getSchema(db);

		const { rows: schemas } =
			await db.sql<SQL_Schemas.Schema>`SELECT * FROM client_schemas WHERE version > ${current_version} ${typeof version === "string" ? `AND version <= ${version}` : ""} ORDER BY created_at DESC`;

		console.log("No updates found");
		for (const schema of schemas) {
			// TODO: GET MIGRATION SQL
			// await executeSchema(db, schema.sql);
			await db.sql`INSERT INTO client_metadata (key, value) VALUES ("${db.name}:schema_version", ${schema.version})`;
		}
	}
}
