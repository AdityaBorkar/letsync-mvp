import { useContext, useState } from "react";

import type { ClientDB } from "@/types/client.js";
import { $fetch } from "@/utils/$fetch.js";
import { Logger } from "@/utils/logger.js";
import { tryCatch } from "@/utils/try-catch.js";

import { SyncContext } from "./SyncProvider.js";

export function useSync() {
	const { config, isPending, setStatus } = useContext(SyncContext);
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
				const console = new Logger(`DB:${name}`, "#ff0");
				const db = database.db;
				console.log("DB", db);

				// Get Current Schema
				const current_schema =
					// @ts-expect-error FIX THIS
					await db
						.execute(
							`SELECT * FROM client_metadata WHERE key = '${name}:schema_version' LIMIT 1`,
						)
						.then(
							// @ts-expect-error FIX THIS
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

				// TODO: Write Schemas
				// @ts-expect-error
				for (const record of schema.data) {
					// @ts-expect-error FIX THIS
					await db.execute(record.sql);
				}

				// Auto Upgrade
				// @ts-expect-error FIX THIS
				if (current_schema !== schema.data.version && autoUpgrade) {
					await upgrade({ latest: true });
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

	async function upgrade(version: string | { latest: true }) {
		if (isPending || !config) {
			console.log(
				"Database have not been initialized yet. Kindly Run `start` first.",
			);
			return;
		}

		for (const [name, database] of config.db.entries()) {
			const db = database.db;
			const current_version =
				// @ts-expect-error
				await db.sql`SELECT * FROM client_metadata WHERE key = ${name}:schema_version LIMIT 1`
					// @ts-expect-error
					.then((res) => res.rows[0].value)
					.catch(() => null);
			const schemas =
				// @ts-expect-error
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
				await db.sql`INSERT INTO client_metadata (key, value) VALUES (${name}:schema_version, ${schema.version})`;
			}
		}
	}

	return { start, terminate, upgrade };
}

async function executeSchema(db: ClientDB.Adapter<unknown>, sql: string) {
	const commands: string[] = sql.split("--> statement-breakpoint");
	const errors: string[] = [];
	for await (const command of commands) {
		// @ts-expect-error FIX THIS
		db.sql`${command}`.catch((err: Error) => {
			errors.push(err.toString());
		});
	}
	if (errors.length > 0) {
		console.error("Schema Execution Failed", errors);
		throw new Error("Schema Execution Failed");
	}
}
