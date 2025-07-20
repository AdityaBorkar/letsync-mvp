import { useContext, useEffect, useState } from "react";

import type { ClientDB } from "@/types/client.js";
import { Logger } from "@/utils/logger.js";
import { tryCatch } from "@/utils/try-catch.js";

import { SyncContext } from "./SyncProvider.js";

export function useDatabase({ name }: { name: string }) {
	const [status, setStatus] = useState<{
		isPending: boolean;
		error: Error | null;
	}>({
		error: null,
		isPending: true,
	});

	const context = useContext(SyncContext);
	const clientDb = context?.db.get(name);

	useEffect(() => {
		if (!clientDb) return;

		const _PerfStart = performance.now();
		tryCatch(setupDb({ db: clientDb.db, name })).then(({ error }) => {
			setStatus({ error, isPending: false });
			const _PerfEnd = performance.now();
			console.log(`Database initialized in ${_PerfEnd - _PerfStart}ms`);
		});
	}, [context, clientDb]);

	return status;
}

async function setupDb({
	name,
	db,
	checkForUpdates = false,
}: {
	name: string;
	db: ClientDB.Adapter<unknown>["db"];
	checkForUpdates?: boolean;
}) {
	const console = new Logger(`[DB:${name}]`);

	// Get Current Schema
	const current_schema =
		// @ts-expect-error FIX THIS
		await db.sql`SELECT * FROM client_metadata WHERE key = ${name}:schema_version`.then(
			// @ts-expect-error FIX THIS
			(result) => result.rows[0]?.value || "",
		);
	console.log("Current Schema", current_schema);

	// If no updates are needed, return
	if (current_schema && !checkForUpdates) return;

	// Get Latest Schema
	const url = current_schema
		? `/api/sync/migration?name=${name}&from=${current_schema}`
		: `/api/sync/schema?name=${name}`;
	const schema = await tryCatch(fetch(url).then((res) => res.json()));
	if (schema.error) {
		console.error("Error fetching schema", schema.error);
		throw schema.error;
	}

	// If no updates
	if (current_schema === schema.data.version) {
		console.log("No updates found");
		return;
	}

	// Update Schema
	// @ts-expect-error FIX THIS
	await executeSchema(db, schema.data.sql);
	// @ts-expect-error FIX THIS
	await db.sql`INSERT INTO client_metadata (key, value) VALUES (${name}:schema_version, ${schema.data.version})`;
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

// import { useContext } from 'react';
// import { LetsyncContext } from '../context.js';

// /**
//  * A React hook that provides access to the Letsync database instance.
//  *
//  * @returns {Object} An object containing the Letsync database instance
//  *
//  * @example
//  * ```tsx
//  * function MyComponent() {
//  *   const database = useDatabase();
//  *
//  *   // Use database
//  *   return <div>...</div>;
//  * }
//  * ```
//  */

// export function useDatabase(name?: string) {
// 	const { db } = useContext(LetsyncContext);

// DATABASE RELATED FEATURES:
// subscribe()
// write()
// read()
// delete()

// 	if (!name && db.length !== 1)
// 		throw new Error(
// 			'Kindly specify a database name or ensure there is only one database configured.',
// 		);

// 	const database = name ? db.find((db) => db.name === name) : db[0];
// 	if (!database) throw new Error(`No database with name "${name}" found.`);

// 	return database;
// }
