import { useContext, useState } from "react";

import { Logger } from "@/utils/logger.js";

// import { tryCatch } from "@/utils/try-catch.js";

// import { setupDb } from "../common/setupDb.js";
// import { syncData_WS } from "../ws/handler.js";
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

	async function start({
		// method,
		upgrade: autoUpgrade = false,
		// checkForUpdates = true,
	}: {
		// method?: "ws" | "sse" | "polling";
		upgrade?: boolean;
		checkForUpdates?: boolean;
	}) {
		// Config
		if (!config) throw new Error("No config found");
		const { db } = config;

		// Setup Databases
		const console = new Logger(`[DB-INIT]`);
		const DB_INIT_START = performance.now();

		// Get Current Schema
		for (const [name, database] of db.entries()) {
			console.log("DB", name, database);
		}
		// for (const database in db.entries()) {
		// 	const db_init = await tryCatch(
		// 		setupDb({
		// 			apiBasePath,
		// 			checkForUpdates,
		// 			schema,
		// 			signal: controller.signal,
		// 		}),
		// 	);
		// }
		// const current_schema =
		// 	// @ts-expect-error FIX THIS
		// 	await db.sql`SELECT * FROM client_metadata WHERE key = ${name}:schema_version`.then(
		// 		// @ts-expect-error FIX THIS
		// 		(result) => result.rows[0]?.value || "",
		// 	);
		// console.log("Current Schema", current_schema);

		// if (current_schema && !checkForUpdates)
		// 	// If no updates are needed, return
		// 	return;

		const DB_INIT_END = performance.now();
		console.log(`Database initialized in ${DB_INIT_END - DB_INIT_START}ms`);
		// setStatus({
		// 	error: db_init.error?.message || null,
		// 	isPending: false,
		// 	isSyncing: false,
		// });
		// if (db_init.error) {
		// 	return;
		// }

		// Auto Upgrade
		if (autoUpgrade) {
			await upgrade("latest");
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
	}

	return { start, terminate, upgrade };
}
