import type { CdcPayload } from "../../utils/contract/server-rpc.js"
import type { WsCtx } from "../index.js"

export async function cdc_get(_props: CdcPayload, _context: WsCtx) {
  // const { userId, cursor, name, subscribeChanges } = props
  // // const db = (context.db.get(name)?.client as any)?.$client
  // // if (!db) {
  // //   throw new Error("Database not found")
  // // }
  // // TODO: Enable LOCK
  // subscribeChanges({
  //   callback(record) {
  //     context.rpc("cdc-records", { ...record, lsn: "" })
  //     // context.rpc("cdc-cache", record)
  //     // TODO: Collect these records in a LIST
  //   },
  //   userId
  // })
  // const RECORDS_LIMIT = 50
  // let $cursor = cursor
  // while (true) {
  //   // biome-ignore lint/performance/noAwaitInLoops: EXCEPTION
  //   const cdc = await db.sql<SQL_Schemas.CdcRecord>`
  //         SELECT * FROM "letsync"."cdc"
  //         WHERE tenantId = ${userId}
  //         ORDER BY id ASC
  //         LIMIT ${RECORDS_LIMIT};
  //       `
  //   // TODO: GET ALL CACHE FROM
  //   // context.rpc("cdc-records", data)
  //   // context.rpc("cdc-cache", data)
  //   $cursor = cdc.rows.at(-1).id
  //   if (cdc.rows.length < RECORDS_LIMIT) break
  // }
  // console.log({ $cursor })
  // // TODO: Disable LOCK
  // console.log(`Subscribed to changes for user: ${userId}`)
  // // TODO: Get Cursor and Integrity & VERIFY
  // // Cron Job - Every 24 hours - merge records into the cache file IF records are greater than 50.
  // context.result()
}

// import type { ServerWebSocket } from "bun"

// import { type } from "arktype"

// import type { WebsocketData } from "../../types.js"
// import type { WebsocketContext } from "../methods/connect.js"

// const message = type({
//   data: {
//     cursor: "Date | null",
//     name: "string"
//   },
//   refId: "string",
//   type: '"sync-request"'
//   // strategy: '"ahead-of-time" | "on-demand"',
// })

// export async function handler(
//   msg: (typeof message.infer)["data"],
//   context: WebsocketContext
// ) {
//   const { userId } = context
//   const { cursor, name } = msg

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

//     const data = { data_ops: dataOps, name, type: "data_operations" }
//     ws.send(JSON.stringify(data))

//     if (dataOps.length > 0 && dataOps.length !== limit) {
//       const cursor = dataOps.at(-1).timestamp
//       await getDataOps({ cursor, limit })
//     }
//   }

//   await getDataOps({ cursor, limit: 50 })
// }

// export const syncRequest = { handler, message }
