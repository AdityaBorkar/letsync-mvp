import type { SyncContextType } from "@/(framework)/react/index.js";
import { $fetch } from "@/utils/$fetch.js";
import { Logger } from "@/utils/logger.js";
import { tryCatch } from "@/utils/try-catch.js";

import { upgrade } from "./upgrade.js";

export async function start(
	params: {
		// method?: "ws" | "sse" | "polling";
		autoUpgrade?: boolean;
		checkForUpdates?: boolean;
	} = {
		autoUpgrade: false,
		checkForUpdates: true,
		// method,
	},
	context: SyncContextType,
) {
	// Context
	const { config, setStatus } = context;

	// Config
	if (!config) throw new Error("No config found");
	const { apiBasePath, db: databases } = config;
	const { autoUpgrade, checkForUpdates } = params;

	// Setup Databases
	const errors: string[] = [];
	for (const [name, db] of databases.entries()) {
		const DB_INIT_START = performance.now();
		try {
			const console = new Logger(`DB:${name}`, "#ff0");
			console.log("DB", db);

			// Get Current Schema
			const current_schema =
				await db.sql`SELECT * FROM client_metadata WHERE key =" ${`${name}:schema_version`}" LIMIT 1`
					.then(
						// @ts-expect-error - result type from database adapter
						(result) => result.rows?.[0]?.value || null,
					)
					.catch((error: Error) => {
						if (
							error.cause
								?.toString()
								.endsWith('relation "client_metadata" does not exist')
						) {
							return null;
						}
						console.error("Error fetching schema", error);
						throw error.cause;
					});
			console.log("Current Schema", current_schema);

			// Skip if no schema or no updates are needed
			if (current_schema && !checkForUpdates) {
				continue;
			}

			const schema = await tryCatch(
				$fetch({
					baseUrl: apiBasePath,
					endpoint: "/schema",
					method: "GET",
					searchParams: current_schema
						? { from: current_schema, name }
						: { name },
				}),
			);
			// @ts-expect-error FIX THIS
			if (schema.error || schema.data.error) {
				// @ts-expect-error FIX THIS
				const error = schema.error || schema.data.error;
				console.error("Error fetching schema", error);
				throw error;
			}
			console.log("Latest Schema", schema.data);

			// Insert schemas using parameterized queries to prevent SQL injection
			// @ts-expect-error - schema.data type from tryCatch utility
			for (const record of schema.data) {
				await db.sql`INSERT INTO client_schemas (checksum, created_at, id, is_rolled_back, snapshot, sql, tag, version)
						VALUES ("${record.checksum}", "${record.created_at}", "${record.id}", ${record.is_rolled_back}, "${record.snapshot}", "${record.sql}", "${record.tag}", ${record.version})`;
			}

			// Auto Upgrade
			// @ts-expect-error FIX THIS
			if (current_schema !== schema.data.version && autoUpgrade) {
				await upgrade({ latest: true }, context);
				console.log("No updates found");
			}
		} catch (error: unknown) {
			errors.push(error instanceof Error ? error.message : String(error));
		} finally {
			const DB_INIT_END = performance.now();
			console.log(`Database initialized in ${DB_INIT_END - DB_INIT_START}ms`);
		}
	}

	// Terminate if there are errors
	if (errors.length > 0) {
		setStatus({
			error: errors.join("\n") || null,
			isPending: false,
			isSyncing: false,
		});
		return;
	}

	// Start Sync
	const SYNC_START_START = performance.now();
	const sync_start = { error: null };
	// await tryCatch(
	// 	syncData_WS({ apiBasePath, db, signal: controller.signal }),
	// );
	const SYNC_START_END = performance.now();
	console.log(`Sync started in ${SYNC_START_END - SYNC_START_START}ms`);
	setStatus({
		error: sync_start.error || null,
		isPending: false,
		isSyncing: true,
	});
}
