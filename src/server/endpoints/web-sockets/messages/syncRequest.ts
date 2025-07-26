import type { ServerWebSocket } from "bun";

import { type } from "arktype";

import type { LetSyncContext } from "@/types/context.js";

import type { WebsocketData } from "../../../ws-handler.js";

const message = type({
	"cursor?": "Date",
	name: "string",
	refId: "string",
	type: '"sync_request"',
	// strategy: '"ahead-of-time" | "on-demand"',
});

export async function handler(
	ws: ServerWebSocket<WebsocketData>,
	msg: typeof message.infer,
	context: LetSyncContext<Request>,
) {
	const userId = ws.data.userId;
	const { cursor, name, refId } = msg;

	// TODO: First sync all the `cdc_cache` records and let the client fetch what it needs.
	// const data_cache = await db.query.cdcCache.findMany({
	// 	limit: 10,
	// 	where: ({ tenantId, createdAt }) =>
	// 		and(eq(tenantId, _tenantId), gte(createdAt, new Date(cursor))),
	// });
	// ws.send(JSON.stringify({ data_cache, name, refId, type: 'data_cache' }));

	// TODO: Every 1000 records must be cached, accordingly `cursor` can be pre-calculated.

	// const getDataCaches = async ({
	// 	cursor,
	// 	limit,
	// }: {
	// 	cursor: number;
	// 	limit: number;
	// }): Promise<void> => {
	// 	const data_caches = await db.query.cdc.findMany({
	// 		limit,
	// 		orderBy: ({ id }) => asc(id),
	// 		where: ({ tenantId, id }) => and(eq(tenantId, _tId), gt(id, cursor)),
	// 	});

	// 	const data = { data_caches, name, refId, type: 'data_cache' };
	// 	ws.send(JSON.stringify(data));

	// 	if (data_caches.length !== limit) {
	// 		const cursor = data_caches[data_caches.length - 1].id;
	// 		await getDataCaches({ cursor, limit });
	// 	}
	// };

	// await getDataCaches({ cursor, limit: 50 });

	const serverDb = context.db.get("postgres"); // ! REPLACE HARDCODED DB NAME
	if (!serverDb) {
		throw new Error("Server database not found");
	}

	const getDataOps = async ({
		limit,
	}: {
		cursor: Date | undefined;
		limit: number;
	}): Promise<void> => {
		// @ts-expect-error FIX THIS
		const data_ops = await serverDb.client.sql`
		SELECT * FROM cdc
		WHERE tenantId = ${userId}
		ORDER BY id ASC
		LIMIT ${limit};
		`
			// @ts-expect-error FIX THIS
			.then((res) => res.rows);

		const data = { data_ops, name, refId, type: "data_operations" };
		ws.send(JSON.stringify(data));

		if (data_ops.length && data_ops.length !== limit) {
			const cursor = data_ops[data_ops.length - 1].timestamp;
			await getDataOps({ cursor, limit });
		}
	};

	await getDataOps({ cursor, limit: 50 });
}

export const syncRequest = { handler, message };
