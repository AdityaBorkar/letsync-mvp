import { useContext, useState } from "react";

import { $fetch } from "@/utils/$fetch.js";
import { Logger } from "@/utils/logger.js";
import { tryCatch } from "@/utils/try-catch.js";

import { SyncContext } from "./SyncProvider.js";

export function useSync() {
	const { config, setStatus } = useContext(SyncContext);
	const [controller, setController] = useState(new AbortController());

	// TODO: Add to `schema`
	// const schema = {
	// 	columns: {
	// 		client_metadata: "client_metadata",
	// 	},
	// };

	async function start(
		params: {
			// method?: "ws" | "sse" | "polling";
			autoUpgrade?: boolean;
			checkForUpdates?: boolean;
		} = {
			autoUpgrade: false,
			checkForUpdates: true,
			// method,
		},
	) {
		// Config
		if (!config) throw new Error("No config found");
		const { apiBasePath, db } = config;
		const { autoUpgrade, checkForUpdates } = params;

		// Setup Databases
		const errors: string[] = [];
		for (const [name, database] of db.entries()) {
			const DB_INIT_START = performance.now();
			try {
				const console = new Logger(`[DB:${name}] `);
				const db = database.db;

				// Get Current Schema
				const current_schema =
					// @ts-expect-error FIX THIS
					await db.sql`SELECT * FROM client_metadata WHERE key = ${name}:schema_version`.then(
						// @ts-expect-error FIX THIS
						(result) => result.rows[0]?.value || "",
					);
				console.log("Current Schema", current_schema);
				// TODO: IF NO SCHEMA, GET THE SCHEMAS AND MINIMUM DATA FOR THE DB TO FUNCTION
				// TODO: FETCH LATEST SCHEMAS and store in the database.

				// Check for Updates
				if (current_schema && !checkForUpdates) {
					continue;
				}
				const schema = await tryCatch(
					$fetch({
						baseUrl: apiBasePath,
						endpoint: "/schema",
						method: "GET",
						searchParams: { from: current_schema, name },
					}),
				);
				if (schema.error) {
					console.error("Error fetching schema", schema.error);
					throw schema.error;
				}
				console.log("Latest Schema", schema.data);

				// Auto Upgrade
				if (current_schema !== schema.data.version && autoUpgrade) {
					await upgrade("latest");
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

	function terminate() {
		controller.abort();
		setController(new AbortController());
	}

	async function upgrade(version: string) {
		// TODO: Upgrade all databases:
		console.log("Upgrading databases", version);
		console.log("TO BE IMPLEMENTED");
		// // Update Schema
		// // @ts-expect-error FIX THIS
		// await executeSchema(db, schema.data.sql);
		// // @ts-expect-error FIX THIS
		// await db.sql`INSERT INTO client_metadata (key, value) VALUES (${name}:schema_version, ${schema.data.version})`;

		// async function executeSchema(db: ClientDB.Adapter<unknown>, sql: string) {
		// 	const commands: string[] = sql.split("--> statement-breakpoint");
		// 	const errors: string[] = [];
		// 	for await (const command of commands) {
		// 		// @ts-expect-error FIX THIS
		// 		db.sql`${command}`.catch((err: Error) => {
		// 			errors.push(err.toString());
		// 		});
		// 	}
		// 	if (errors.length > 0) {
		// 		console.error("Schema Execution Failed", errors);
		// 		throw new Error("Schema Execution Failed");
		// 	}
		// }
	}

	return { start, terminate, upgrade };
}
