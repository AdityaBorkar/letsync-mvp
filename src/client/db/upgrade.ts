import type { SyncContextType } from "@/(framework)/react/index.js";

export async function upgrade(
	version: string | { latest: true },
	context: SyncContextType,
) {
	const { config, isPending } = context;

	if (isPending || !config) {
		console.log(
			"Database have not been initialized yet. Kindly Run `start` first.",
		);
		return;
	}

	for (const [name, db] of config.db.entries()) {
		const current_version =
			await db.sql`SELECT * FROM client_metadata WHERE key = "${name}:schema_version" LIMIT 1`
				// @ts-expect-error
				.then((res) => res.rows[0].value)
				.catch(() => null);
		const schemas =
			await db.sql`SELECT * FROM client_schemas WHERE version > ${current_version} ${typeof version === "string" ? `AND version <= ${version}` : ""} ORDER BY created_at DESC`
				// @ts-expect-error
				.then((res) => res.rows)
				.catch(() => null);
		// console.log("No updates found");
		for (const schema of schemas ?? []) {
			// TODO: GET MIGRATION SQL
			// @ts-expect-error
			await executeSchema(db, schema.sql);
			// @ts-expect-error
			await db.execute(
				`INSERT INTO client_metadata (key, value) VALUES ("${name}:schema_version", ${schema.version})`,
			);
		}
	}
}
