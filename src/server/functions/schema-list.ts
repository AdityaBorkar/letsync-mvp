import { ArkErrors, type } from "arktype";
import type { BunRequest } from "bun";

import type { Context } from "../config.js";

// TODO: Cache Requests for 365 days, if returns 200 (ISR)
// TODO: Cache Requests for 24 hrs, if returns 404 (ISR)

const schema = type({
	name: "string",
	version: "number | undefined",
});

export async function getSchema(request: BunRequest, context: Context) {
	const { searchParams } = new URL(request.url);
	const data = schema({
		name: searchParams.get("name"),
		version: searchParams.get("version") ?? undefined,
	});
	if (data instanceof ArkErrors) {
		return Response.json({ error: data.join("\n") }, { status: 400 });
	}
	const { version } = data;
	if (!version) {
		return Response.json(
			{ error: `Schema version '${version}' not found` },
			{ status: 400 },
		);
	}

	const serverDb = getServerDb(context);
	if (!serverDb) {
		throw new Error("Server database not found");
	}

	const records = await serverDb.schema.list(version.toString());
	if (records.length === 0) {
		return Response.json(
			{ error: `Schema version '${version}' not found` },
			{ status: 400 },
		);
	}
	return Response.json(records);
}

function getServerDb(context: Context) {
	const { db } = context;
	const DEFAULT_DB = "postgres"; // TODO: Make this dynamic
	if (db.size === 1) return db.values().next().value;
	return db.get(DEFAULT_DB);
}
