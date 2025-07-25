import type { BunRequest } from "bun";

import { ArkErrors, type } from "arktype";

import type { LetSyncContext } from "@/types/context.js";
import type { ServerDB } from "@/types/server.js";

// TODO: Cache Requests for 365 days, if returns 200 (ISR)
// TODO: Cache Requests for 24 hrs, if returns 404 (ISR)

const schema = type({
	name: "string",
	version: "number | undefined",
});

export async function getSchema(
	request: BunRequest,
	context: LetSyncContext<Request>,
) {
	const { searchParams } = new URL(request.url);
	const data = schema({
		name: searchParams.get("name"),
		version: searchParams.get("version") ?? undefined,
	});
	if (data instanceof ArkErrors) {
		return Response.json({ error: data.join("\n") }, { status: 400 });
	}
	const { version } = data;

	// @ts-expect-error
	const serverDb = getServerDb(context.db);
	if (!serverDb) {
		throw new Error("Server database not found");
	}

	const records = await serverDb
		// @ts-expect-error
		.execute(
			`SELECT * FROM client_schemas ${version ? `WHERE version > ${version}` : ""} ORDER BY created_at ${version ? "ASC" : "DESC LIMIT 1;"}`,
			// TODO: Implement `name`
			// AND name = '${name}'
		)
		// @ts-expect-error
		.then((res) => res.rows);

	if (!records.length) {
		return Response.json(
			{ error: `Schema version '${version}' not found` },
			{ status: 400 },
		);
	}
	return Response.json(records);
}

function getServerDb(db: Map<string, ServerDB.Adapter<unknown>>) {
	const DEFAULT_DB = "postgres"; // TODO: Make this dynamic
	if (db.size === 1) return db.values().next().value?.db;
	return db.get(DEFAULT_DB)?.db;
}
