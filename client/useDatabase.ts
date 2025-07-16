import type { PGlite } from "@electric-sql/pglite";
import { eq } from "drizzle-orm";
import { useEffect, useState } from "react";

import { clientMetadata } from "#letsync/client/schemas/drizzle-postgres";
import { tryCatch } from "#letsync/utils/tryCatch";
import { db } from "@/lib/db/client";

export function useDatabase({
	name,
	client,
}: {
	client: PGlite;
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
	client: PGlite;
	checkForUpdates?: boolean;
}) {
	const _LogsPrefix = `[DB:${name}]`;

	// Get Current Schema
	const current_schema = await db.query.clientMetadata
		.findFirst({
			where: ({ key }) => eq(key, `${name}:schema_version`),
		})
		.then((res) => res?.value || "")
		.catch(() => "");
	console.log(_LogsPrefix, "Current Schema", current_schema);

	// If no updates are needed, return
	if (current_schema && !checkForUpdates) return;

	// Get Latest Schema
	const url = current_schema
		? `/api/sync/migration?name=${name}&from=${current_schema}`
		: `/api/sync/schema?name=${name}`;
	const schema = await tryCatch(fetch(url).then((res) => res.json()));
	if (schema.error) {
		console.error(_LogsPrefix, "Error fetching schema", schema.error);
		throw schema.error;
	}

	// If no updates
	if (current_schema === schema.data.version) {
		console.log(_LogsPrefix, "No updates found");
		return;
	}

	// Update Schema
	await executeSchema(client, schema.data.sql);
	await db.insert(clientMetadata).values({
		key: `${name}:schema_version`,
		value: schema.data.version,
	});
}

async function executeSchema(client: PGlite, sql: string) {
	const commands: string[] = sql.split("--> statement-breakpoint");
	const errors: string[] = [];
	for await (const command of commands) {
		client.query(command).catch((err) => {
			errors.push(err.toString());
		});
	}
	if (errors.length > 0) {
		console.error("Schema Execution Failed", errors);
		throw new Error("Schema Execution Failed");
	}
}
