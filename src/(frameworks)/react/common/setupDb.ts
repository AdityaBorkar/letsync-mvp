import type { ClientDB } from "@/types/client.js";
import { $fetch } from "@/utils/$fetch.js";
import { Logger } from "@/utils/logger.js";
import { tryCatch } from "@/utils/try-catch.js";

export async function setupDb({
	apiBasePath,
	db,
	checkForUpdates = false,
	// schema,
	name,
	signal,
}: {
	apiBasePath: string;
	db: ClientDB.Adapter<unknown>["db"];
	checkForUpdates?: boolean;
	name: string;
	signal: AbortSignal;
}) {
	// TODO: IF NO SCHEMA, GET THE SCHEMAS AND MINIMUM DATA FOR THE DB TO FUNCTION
	// TODO: FETCH LATEST SCHEMAS and store in the database.

	// // Get Latest Schema
	// const schema = await tryCatch(
	// 	$fetch({
	// 		baseUrl: apiBasePath,
	// 		endpoint: current_schema ? "/schema/migration" : "/schema",
	// 		method: "GET",
	// 		searchParams: { from: current_schema ? current_schema : undefined, name },
	// 	}),
	// );
	// if (schema.error) {
	// 	console.error("Error fetching schema", schema.error);
	// 	throw schema.error;
	// }

	// // If no updates
	// if (current_schema === schema.data.version) {
	// 	console.log("No updates found");
	// 	return;
	// }

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
