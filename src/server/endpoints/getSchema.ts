import type { BunRequest } from "bun";

import { type } from "arktype";

import type { LetSyncContext } from "@/types/context.js";

// TODO: Cache Requests for 365 days, if returns 200 (ISR)
// TODO: Cache Requests for 24 hrs, if returns 404 (ISR)

const schema = type({
	name: "string",
	"version?": "number",
});

export async function getSchema(
	request: BunRequest,
	context: LetSyncContext<Request>,
) {
	// Request Validation
	const { searchParams } = new URL(request.url);
	const name = searchParams.get("name");
	const version = searchParams.get("version");
	const data = schema({ name, version });
	if ("error" in data) {
		return Response.json({ error: data.error }, { status: 400 });
	}

	// Return Schema
	const serverDb = context.db.get("postgres"); // ! REPLACE HARDCODED DB NAME
	if (!serverDb) {
		throw new Error("Server database not found");
	}
	// @ts-expect-error
	const record = await serverDb.db.sql`
		SELECT * FROM client_schemas
		WHERE version = ${version}
		ORDER BY createdAt DESC
		LIMIT 1;
		`
		// @ts-expect-error
		.then((res) => res.rows[0]);

	if (!record) {
		throw new Error(`Schema version ${version} not found`);
	}
	return Response.json(record);
}
