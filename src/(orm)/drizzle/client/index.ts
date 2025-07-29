import type { ClientDB, GenericObject } from "@/types/client.js";
import type { SQL_Schemas } from "@/types/schemas.js";
import { generateName } from "@/utils/generate-name.js";

import { close } from "./close.js";
import { connect } from "./connect.js";
import { dump } from "./dump.js";
import { flush } from "./flush.js";
import { metadata } from "./metadata.js";
import { schema } from "./schema.js";
import { size } from "./size.js";
import type { DrizzleClientDb } from "./types.js";

export function registerClientDb<T extends DrizzleClientDb>({
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
		close: () => close(client),
		connect: () => connect(client),
		dump: (_: Parameters<typeof dump>[1]) => dump(client, _),
		flush: () => flush(client),
		metadata: {
			get: (key: string) => metadata.get(client, key),
			remove: (key: string) => metadata.remove(client, key),
			set: (key: string, value: string | boolean | GenericObject) =>
				metadata.set(client, key, value),
		},
		name,
		schema: {
			apply: (record: SQL_Schemas.Schema) => schema.apply(client, record),
			insert: (records: SQL_Schemas.Schema[]) => schema.insert(client, records),
			list: (aboveVersion?: string) => schema.list(client, aboveVersion),
			pull: () => schema.pull(client),
		},
		size: () => size(client),
	} satisfies ClientDB.Adapter<T>;
}
