import type { ClientDB } from "@/types/client.js";
import type { SQL_Schemas } from "@/types/schemas.js";
import { generateName } from "@/utils/generate-name.js";

import { close } from "./functions/close.js";
import { dump } from "./functions/dump.js";
import { flush } from "./functions/flush.js";
import { metadata } from "./functions/metadata.js";
import { schema } from "./functions/schema.js";
import { size } from "./functions/size.js";
import { start } from "./functions/start.js";
import type { DrizzleDB } from "./types.js";

export function registerClientDb<T extends DrizzleDB>({
	name = generateName(),
	client,
}: {
	name?: string;
	client: T;
}) {
	// TODO: DO NOT ALLOW DIRECT WRITES TO TABLES (IMPLEMENT USING USER ROLES / ACL)
	return {
		__brand: "LETSYNC_CLIENT_DB",
		client,
		name,
		close: () => close(client),
		start: () => start(client),
		flush: () => flush(client),
		metadata: {
			get: (key: string) => metadata.get(client, key),
			set: (key: string, value: string | boolean | Object) =>
				metadata.set(client, key, value),
			remove: (key: string) => metadata.remove(client, key),
		},
		size: () => size(client),
		dump: (_: Parameters<typeof dump>[1]) => dump(client, _),
		schema: {
			pull: () => schema.pull(client),
			insert: (records: SQL_Schemas.Schema[]) => schema.insert(client, records),
			list: (aboveVersion?: string) => schema.list(client, aboveVersion),
			apply: (record: SQL_Schemas.Schema) => schema.apply(client, record),
		},
	} as ClientDB.Adapter<T>;
}
