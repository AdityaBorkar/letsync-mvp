import type { DrizzleClientDb } from "../index.js"

export async function size(db: DrizzleClientDb) {
  const data = await db.execute(
    `SELECT pg_size_pretty(pg_database_size('public'))`
  )
  console.log(data)
  const size = data.rows[0]?.pg_size_pretty
  return Number(size)
}

// // Get the total size of all tables in the database
// // TODO - Correct typescript support
// const result = await database.sql<DatabaseSizeRecord>`
// 	SELECT
// 		pg_database_size(current_database()) / (1024.0 * 1024.0) as total_mb,
// 		pg_database_size(current_database()) / (1024.0 * 1024.0) as used_mb,
// 		0 as free_mb
// `;

// const metrics = result.rows[0];
// console.log({ metrics });

// return {
// 	free: 0,
// 	total: Number(metrics?.total_mb || 0),
// 	used: Number(metrics?.used_mb || 0),
// };
