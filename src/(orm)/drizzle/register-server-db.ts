import { sql } from "drizzle-orm";

import type { ServerDB } from "@/types/server.js";

import { close } from "./functions/close.js";
import type { DrizzleDB } from "./types.js";

export function registerServerDb<T extends DrizzleDB>({
	name,
	client,
}: {
	name: string;
	client: T;
}) {
	// TODO - Connection Pooling on backend
	// 	async function waitUntilReady() {
	// 		try {
	// 			await database.connect();
	// 		} catch (error) {
	// 			console.warn("Connection warning!");
	// 		}
	// 	}
	return {
		__brand: "LETSYNC_SERVER_DB",
		client,
		close: () => close(client),
		name,
		sql: (template: TemplateStringsArray | string, ...args: unknown[]) => {
			if (!args.length) {
				return client.execute(template as string);
			}
			return client.execute(sql(template as TemplateStringsArray, ...args));
		},
		// open: () => open(client),
		// ---
		// TODO - ADD OPTION TO SUBSCRIBE, TO READ OPTIMISTIC OR NOT
		// TODO - add to database (optimistic) (and inform subscribers)
		// TODO: DO NOT ALLOW DIRECT WRITES TO TABLES
	} as unknown as ServerDB.Adapter<T>;
}

// const metadata = {
// 	async remove(key: string) {
// 		await operations.sql`DELETE FROM metadata WHERE name = ${key}`;
// 	},
// 	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
// 	async upsert(key: string, content: { [key: string]: any }) {
// 		const contentJson = JSON.stringify(content);
// 		await operations.sql`INSERT INTO metadata (name, content, lastUpdated) VALUES (${key}, ${contentJson}, ${new Date().toISOString()}) ON CONFLICT (name) DO UPDATE SET content = EXCLUDED.content, lastUpdated = EXCLUDED.lastUpdated`;
// 	},
// 	async get(key: string) {
// 		const record = await operations.sql<
// 			TableRecords["Metadata"]
// 		>`SELECT * FROM metadata WHERE name = ${key}`;
// 		// TODO - What if multiple records are found in NoSQL databases?
// 		const content = record.rows[0]?.content;
// 		if (!content) return null;
// 		return JSON.parse(content);
// 	},
// } satisfies ClientDB_MetadataManager;
