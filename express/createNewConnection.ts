import { createId } from "@paralleldrive/cuid2";
import * as schema from "drizzle/schema";

import db from "@/lib/server-db";

export async function createNewConnection(user: { id: string }) {
	const version = 1; // TODO: GET LATEST SCHEMA VERSION TAG
	const name = "Session"; // TODO: Identify client & IP
	const connection = await db // TODO: REPLACE DB
		.insert(schema.connection)
		.values({
			id: createId(),
			lastSyncedAt: new Date(),
			name,
			userId: user.id,
			version,
		})
		.returning()
		.then(([connection]) => connection);
	return connection;
}
