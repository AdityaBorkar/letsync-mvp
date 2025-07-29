import type { ServerDB } from "@/types/server.js";

import { close } from "./close.js";
import { connect } from "./connect.js";
import { schema } from "./schema.js";
import type { DrizzleServerDb } from "./types.js";

export function registerServerDb<T extends DrizzleServerDb>({
	name,
	client,
}: {
	name: string;
	client: T;
}) {
	return {
		__brand: "LETSYNC_SERVER_DB",
		client,
		close: () => close(client),
		connect: () => connect(client),
		name,
		schema: {
			list: (aboveVersion?: string, belowVersion?: string) =>
				schema.list(client, aboveVersion, belowVersion),
		},
	} satisfies ServerDB.Adapter<T>;
}
