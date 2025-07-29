import { sql } from "drizzle-orm";

import type { ClientDB } from "@/types/client.js";
import { generateName } from "@/utils/generate-name.js";

import { close } from "./functions/close.js";
import { flush } from "./functions/flush.js";
import type { DrizzleDB } from "./types.js";

// TODO: Change the drizzle-orm type
export function registerClientDb<T extends DrizzleDB>({
	name = generateName(),
	client,
}: {
	name?: string;
	client: T;
}) {
	return {
		__brand: "LETSYNC_CLIENT_DB",
		client,
		close: () => close(client),
		flush: () => flush(client),
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
		// ---
		// storageMetrics: () => void;
		// storageMetrics: () => getStorageMetrics(dbClient),
		// ---
		// exportData: (options: Parameters<typeof exportData>[1]) =>
		// 	exportData({ client: dbClient, schema }, options),
		// exportData: (options: {
		// 	compression: "none" | "gzip" | "auto";
		// }) => Promise<File | Blob>;
	} as ClientDB.Adapter<T>;
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
