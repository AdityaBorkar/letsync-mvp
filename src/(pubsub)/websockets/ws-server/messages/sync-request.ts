import { type } from "arktype"

import { MessageType } from "../../utils/schema.js"
import type { WsContext } from "../index.js"

type MsgData = typeof msgData.infer
const msgData = type({
  cursor: "string | null",
  name: "string"
  // strategy: '"ahead-of-time" | "on-demand"',
})

export const handler = (msg: MsgData, context: WsContext) => {
  // TODO: Implement data synchronization logic
  // - SUBSCRIBE TO DB UPDATES / Set up websocket subscriptions

  // - Fetch data from CDN/DB
  // - Implement cursor verification
  // 1. Use PubSub in Postgres OR use the WAL
  // 2. Store all transactions in CDC from WAL or MANUAL or PubSub.
  // 3. Cron Job - Every 24 hours - merge records into the cache file IF records are greater than 50.
  // 4. DO NOT USE THE FILESYSTEM API TO STORE CACHE FOR NOW. Use a hardcoded solution in WS itself with the names - fs-client / fs-server

  const { cursor, name } = msg
  const db = (context.db.get(name)?.client as any)?.$client
  if (!db) {
    throw new Error("Database not found")
  }

  console.log({ cursor })
  // const RECORDS_LIMIT = 50
  // let $cursor = cursor
  // for (; ; true) {
  //   // TODO: GET ALL CACHE FROM
  //   const cdc = await db.sql<SQL_Schemas.CdcRecord>`
  //         SELECT * FROM "letsync"."cdc"
  //         WHERE tenantId = ${context.user.id}
  //         ORDER BY id ASC
  //         LIMIT ${RECORDS_LIMIT};
  //       `
  //   // context.rpc("cdc-records", data)
  //   // context.rpc("cdc-cache", data)
  //   $cursor = cdc.rows.at(-1).id
  //   if (cdc.rows.length < RECORDS_LIMIT) break
  // }

  // TODO: Get Cursor and Integrity & VERIFY

  context.end()
}

export const syncRequest = {
  handler,
  message: MessageType("'sync-request'", msgData)
}

// Basic Conflice Resolution - Last Write Wins.

// insert into tenants (id, name) values ('d24419bf-6122-4879-afa5-1d9c1b051d72', 'my first customer');
// select * from tenants;

// insert into todos (tenant_id, title, estimate, embedding, complete) values ('d24419bf-6122-4879-afa5-1d9c1b051d72', 'feed my cat', '1h', '[1,2,3]', false);

// SELECT tenants.name, title, embedding, estimate, complete
// FROM todos join tenants on tenants.id = todos.tenant_id;

// export async function handler(
//   ws: ServerWebSocket<WebsocketData>,
//   msg: typeof message.infer,
//   context: Context
// ) {

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
