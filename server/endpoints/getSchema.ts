import type { BunRequest } from 'bun';

import { type } from 'arktype';
import { desc, sql } from 'drizzle-orm';

import { clientSchemas } from '#letsync/client/schemas/drizzle-postgres';
import { db } from '@/lib/db/server'; // TODO: Outsource db to a separate module

// TODO: Cache Requests for 365 days, if returns 200 (ISR)
// TODO: Cache Requests for 24 hrs, if returns 404 (ISR)

const schema = type({
	name: 'string',
	'version?': 'number',
});

export async function getSchema(request: BunRequest) {
	// Request Validation
	const { searchParams } = new URL(request.url);
	const name = searchParams.get('name');
	const version = searchParams.get('version');
	const data = schema({ name, version });
	if ('error' in data) {
		return Response.json({ error: data.error }, { status: 400 });
	}

	// Return Schema
	const record = await _getSchema(version);
	return Response.json(record);
}

async function _getSchema(version: string | null) {
	const [record] = await db
		.select()
		.from(clientSchemas)
		.where(version ? sql`${clientSchemas.version} = ${version}` : undefined)
		.orderBy(desc(clientSchemas.createdAt))
		.limit(1);
	if (!record) {
		throw new Error(`Schema version ${version} not found`);
	}
	return record;
}
