import { ArkErrors, type } from "arktype";
import type { BunRequest } from "bun";

import type { ServerContext } from "@/types/context.js";
import type { SQL_Schemas } from "@/types/schemas.js";

// TODO: Cache Requests for 365 days, if returns 200 (ISR)
// TODO: Cache Requests for 24 hrs, if returns 404 (ISR)

const schema = type({
	name: "string",
	version: "number | undefined",
});

export async function getSchema(
	request: BunRequest,
	context: ServerContext<Request>,
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

	const serverDb = getServerDb(context);
	if (!serverDb) {
		throw new Error("Server database not found");
	}

	// TODO: Implement `name`
	// AND name = '${name}'
	const { rows: records } = await serverDb.sql<
		SQL_Schemas.Schema[]
	>`SELECT * FROM client_schemas ${version ? `WHERE version > ${version}` : ""} ORDER BY created_at ${version ? "ASC" : "DESC LIMIT 1;"}`;

	if (records.length === 0) {
		return Response.json(
			{ error: `Schema version '${version}' not found` },
			{ status: 400 },
		);
	}
	return Response.json(records);
}

function getServerDb(context: ServerContext<Request>) {
	const { db } = context;
	const DEFAULT_DB = "postgres"; // TODO: Make this dynamic
	if (db.size === 1) return db.values().next().value;
	return db.get(DEFAULT_DB);
}
