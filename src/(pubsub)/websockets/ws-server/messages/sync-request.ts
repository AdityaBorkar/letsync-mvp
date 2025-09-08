import { type } from "arktype"

import type { WebsocketContext } from "../index.js"

export const message = type({
  data: {
    cursor: "string | null",
    name: "string"
  },
  refId: "string",
  type: '"sync-request"'
})

export const handler = (
  msg: (typeof message.infer)["data"],
  context: WebsocketContext
) => {
  const { cursor, name } = msg
  const data: { name: string; data_ops: any[]; cursor?: string } = {
    data_ops: [],
    name
  }
  if (cursor) {
    data.cursor = cursor
  }
  // TODO: Implement data synchronization logic
  // - SUBSCRIBE TO DB UPDATES
  // - Fetch data from CDN/DB
  // - Set up websocket subscriptions
  // - Implement cursor verification

  // context.rpc("cdc-records", data)
  // context.rpc("cdc-cache", data)
  context.end()
}

export const syncRequest = { handler, message }

// import type { ServerWebSocket } from "bun"

// import { type } from "arktype"

// import type { Context } from "../../../../server/config.js"
// import type { WebsocketData } from "../../types.js"

// const message = type({
//   "cursor?": "Date",
//   name: "string",
//   refId: "string",
//   type: '"sync_request"'
//   // strategy: '"ahead-of-time" | "on-demand"',
// })

// export async function handler(
//   ws: ServerWebSocket<WebsocketData>,
//   msg: typeof message.infer,
//   context: Context
// ) {
//   const userId = ws.data.userId
//   const { cursor, name, refId } = msg

//   // TODO: First sync all the `cdc_cache` records and let the client fetch what it needs.
//   // const data_cache = await db.query.cdcCache.findMany({
//   // 	limit: 10,
//   // 	where: ({ tenantId, createdAt }) =>
//   // 		and(eq(tenantId, _tenantId), gte(createdAt, new Date(cursor))),
//   // });
//   // ws.send(JSON.stringify({ data_cache, name, refId, type: 'data_cache' }));

//   // TODO: Every 1000 records must be cached, accordingly `cursor` can be pre-calculated.

//   // const getDataCaches = async ({
//   // 	cursor,
//   // 	limit,
//   // }: {
//   // 	cursor: number;
//   // 	limit: number;
//   // }): Promise<void> => {
//   // 	const data_caches = await db.query.cdc.findMany({
//   // 		limit,
//   // 		orderBy: ({ id }) => asc(id),
//   // 		where: ({ tenantId, id }) => and(eq(tenantId, _tId), gt(id, cursor)),
//   // 	});

//   // 	const data = { data_caches, name, refId, type: 'data_cache' };
//   // 	ws.send(JSON.stringify(data));

//   // 	if (data_caches.length !== limit) {
//   // 		const cursor = data_caches[data_caches.length - 1].id;
//   // 		await getDataCaches({ cursor, limit });
//   // 	}
//   // };

//   // await getDataCaches({ cursor, limit: 50 });

//   const serverDb = context.db.get("postgres") // ! REPLACE HARDCODED DB NAME
//   if (!serverDb) {
//     throw new Error("Server database not found")
//   }

//   const getDataOps = async ({
//     limit
//   }: {
//     cursor: Date | undefined
//     limit: number
//   }): Promise<void> => {
//     const db = serverDb.client as any
//     const dataOps = await db.$client.sql`
//       SELECT * FROM "letsync"."cdc"
//       WHERE tenantId = ${userId}
//       ORDER BY id ASC
//       LIMIT ${limit};
// 		`

//     const data = { data_ops: dataOps, name, refId, type: "data_operations" }
//     ws.send(JSON.stringify(data))

//     if (dataOps.length > 0 && dataOps.length !== limit) {
//       const cursor = dataOps.at(-1).timestamp
//       await getDataOps({ cursor, limit })
//     }
//   }

//   await getDataOps({ cursor, limit: 50 })
// }

// export const syncRequest = { handler, message }
