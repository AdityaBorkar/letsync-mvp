import type { ClientDB } from "@/types/client.js";

export async function executeSQL(db: ClientDB.Adapter<unknown>, sql: string) {
	const commands: string[] = sql.split("--> statement-breakpoint");
	const errors: string[] = [];
	for await (const command of commands) {
		try {
			await db.sql(command);
		} catch (err: unknown) {
			errors.push(err instanceof Error ? err.toString() : String(err));
		}
	}
	if (errors.length > 0) {
		console.error("Schema Execution Failed", errors);
		throw new Error("Schema Execution Failed");
	}
}
