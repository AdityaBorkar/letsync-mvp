import { sql } from "drizzle-orm";

import type { DrizzleDB } from "../types.js";

export async function flush(client: DrizzleDB) {
	// Drop all tables in the current database
	await client.execute(sql`
		DO $$
		DECLARE
			r RECORD;
		BEGIN
			FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
				EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
			END LOOP;
		END $$;
	`);

	// Drop all sequences
	await client.execute(sql`
		DO $$
		DECLARE
			r RECORD;
		BEGIN
			FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
				EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
			END LOOP;
		END $$;
	`);

	return;
}
