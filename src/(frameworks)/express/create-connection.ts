import { createId } from '@paralleldrive/cuid2';

import type { Database } from '../../types.js';

export async function createNewConnection(db: Database, user: { id: string }) {
	const version = 1; // TODO: GET LATEST SCHEMA VERSION TAG
	const name = 'Session'; // TODO: Identify client & IP

	const [connection] = await db.sql`
		INSERT INTO connection (id, last_synced_at, name, user_id, version)
		VALUES (${createId()}, ${new Date()}, ${name}, ${user.id}, ${version})
		RETURNING *
	`.execute();

	return connection;
}
