import { useEffect, useState } from "react";

import type { ClientDB } from "@/types/index.js";
import { Logger } from "@/utils/logger.js";
import { tryCatch } from "@/utils/try-catch.js";

export function useDatabase({
	name,
	client,
}: {
	client: ClientDB.Adapter<unknown>;
	name: string;
}) {
	const [status, setStatus] = useState<{
		isPending: boolean;
		error: Error | null;
	}>({
		error: null,
		isPending: true,
	});

	useEffect(() => {
		const _PerfStart = performance.now();
		tryCatch(setupDb({ client, name })).then(({ error }) => {
			setStatus({ error, isPending: false });
			const _PerfEnd = performance.now();
			console.log(`Database initialized in ${_PerfEnd - _PerfStart}ms`);
		});
	}, [client, name]);

	return status;
}

async function setupDb({
	name,
	client,
	checkForUpdates = false,
}: {
	name: string;
	client: ClientDB.Adapter<unknown>;
	checkForUpdates?: boolean;
}) {
	const console = new Logger(`[DB:${name}]`);

	// Get Current Schema
	const current_schema =
		await client.sql`SELECT * FROM client_metadata WHERE key = ${name}:schema_version`.then(
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
	await executeSchema(client, schema.data.sql);
	await client.sql`INSERT INTO client_metadata (key, value) VALUES (${name}:schema_version, ${schema.data.version})`;
}

async function executeSchema(client: ClientDB.Adapter<unknown>, sql: string) {
	const commands: string[] = sql.split("--> statement-breakpoint");
	const errors: string[] = [];
	for await (const command of commands) {
		client.sql`${command}`.catch((err) => {
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
