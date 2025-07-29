import type { SQL_Schemas } from "@/types/schemas.js";
import type { Context } from "../config.js";
import { executeSQL } from "../utils/execute-sql.js";
import { metadata } from "../utils/metadata.js";
import { schema } from "../utils/schema.js";
import { DataSync } from "./data-sync.js";
import { SchemaCheckForUpdates } from "./schema-check-for-updates.js";
import { SchemaUpgrade } from "./schema-upgrade.js";

export async function SyncStart(
	props: { autoUpgrade: boolean; checkForUpdates: boolean },
	context: Context,
) {
	const { checkForUpdates, autoUpgrade } = props;

	for await (const [, db] of context.db.entries()) {
		await db.start();

		const version = await metadata.get(db, `${db.name}:schema_version`);

		if (!version) {
			const response = await context.fetch("GET", "/schema", {
				searchParams: { name: db.name },
			});
			if (response.error) {
				console.error(response.error);
				continue;
			}
			const _schema = response.data as SQL_Schemas.Schema;
			await executeSQL(db, _schema.sql);
			await metadata.set(
				db,
				`${db.name}:schema_version`,
				String(_schema.version),
			);
			const applied_at = new Date().toISOString();
			await schema.upsert(db, { ..._schema, applied_at });
			continue;
		}

		if (checkForUpdates) {
			await SchemaCheckForUpdates({ dbName: db.name }, context);
		}

		if (autoUpgrade) {
			await SchemaUpgrade(
				{ dbName: db.name, version: { latest: true } },
				context,
			);
		}
	}

	context.status.isDbRunning.set(true);

	await DataSync(undefined, context);
}
