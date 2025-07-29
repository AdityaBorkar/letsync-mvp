import type { Context } from "../config.js";

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

		const current_version =
			await db.sql`SELECT * FROM client_metadata WHERE key = "${db.name}:schema_version" LIMIT 1`
				// @ts-expect-error
				.then((res) => res.rows[0].value)
				.catch(() => null);

		const schemas =
			await db.sql`SELECT * FROM client_schemas WHERE version > ${current_version} ${typeof version === "string" ? `AND version <= ${version}` : ""} ORDER BY created_at DESC`
				// @ts-expect-error
				.then((res) => res.rows)
				.catch(() => null);

		console.log("No updates found");
		for (const schema of schemas ?? []) {
			// TODO: GET MIGRATION SQL
			// await executeSchema(db, schema.sql);
			await db.sql`INSERT INTO client_metadata (key, value) VALUES ("${db.name}:schema_version", ${schema.version})`;
		}
	}
}
