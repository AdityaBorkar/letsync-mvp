import type { DrizzleDB } from "../types.js";

export async function size(db: DrizzleDB) {
	const data = await db.execute(
		`SELECT pg_size_pretty(pg_database_size('public'))`,
	);
	console.log(data);
	return data.rows[0]?.pg_size_pretty;
}
