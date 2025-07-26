import type { SyncContextType } from "@/(framework)/react/index.js";
import { $fetch } from "@/utils/$fetch.js";
import { Logger } from "@/utils/logger.js";
import { tryCatch } from "@/utils/try-catch.js";

import { syncData } from "./syncData.js";
import { upgrade } from "./upgrade.js";
import { getSchema, insertSchemas } from "./utils/schema.js";

export async function start(
	params: {
		autoUpgrade?: boolean;
		checkForUpdates?: boolean;
	} = {
		autoUpgrade: false,
		checkForUpdates: true,
	},
	context: SyncContextType,
) {
	// Context
	const { config, setStatus } = context;

	// Config
	if (!config) throw new Error("No config found");
	const { api, db: databases } = config;
	const { autoUpgrade, checkForUpdates } = params;

	// Setup Databases
	const errors: string[] = [];
	for (const [name, db] of databases.entries()) {
		const DB_INIT_START = performance.now();
		try {
			const console = new Logger(`DB:${name}`, "#ff0");
			console.log("DB", db);

			const CurrentVersion = await getSchema(db, name);
			console.log("Current Schema", CurrentVersion);

			// Skip if no schema or no updates are needed
			if (CurrentVersion && !checkForUpdates) {
				continue;
			}

			const schema = await tryCatch(
				$fetch({
					baseUrl: api.basePath,
					endpoint: "/schema",
					method: "GET",
					searchParams: CurrentVersion
						? { from: CurrentVersion, name }
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
			// @ts-expect-error FIX THIS
			await insertSchemas(db, schema.data);

			// Auto Upgrade
			// @ts-expect-error FIX THIS
			const LatestVersion = schema.data[0]?.version;
			if (CurrentVersion > LatestVersion) {
				throw new Error(
					"Database is corrupted. Current Version is greater than Latest Version.",
				);
			}
			if (CurrentVersion < LatestVersion && autoUpgrade) {
				await upgrade({ latest: true }, context);
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
			isDbRunning: false,
			isSyncing: false,
		});
		return;
	}

	// Start Sync
	await tryCatch(syncData(context));
}
