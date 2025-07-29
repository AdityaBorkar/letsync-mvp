import type { GenericObject } from "@/types/client.js";
import { tryCatch } from "@/utils/try-catch.js";

import { sql } from "./sql.js";
import type { DrizzleClientDb } from "./types.js";

export const metadata = {
	async get(db: DrizzleClientDb, key: string) {
		const data = await tryCatch(
			// @ts-expect-error
			sql(db, `SELECT * FROM client_metadata WHERE key=${key} LIMIT 1`),
		);
		console.log(data);
		// TODO: Complete This
		// SQL_Schemas.Metadata
		// return JSON.parse(content);
		// return data.rows[0]?.value || null;
		return "";
	},
	async remove(db: DrizzleClientDb, key: string) {
		await sql(db, `DELETE FROM client_metadata WHERE key = ${key}`);
	},
	async set(
		db: DrizzleClientDb,
		key: string,
		value: string | boolean | GenericObject,
	) {
		const type = typeof value;
		if (!["string", "boolean", "object"].includes(type)) {
			throw new Error("Invalid value type");
		}
		const data = type === "object" ? JSON.stringify(value) : value;
		await sql(
			db,
			`INSERT INTO client_metadata (key, type, value) VALUES (${key}, ${type}, ${data}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
		);
	},
};

// @ts-expect-error - TODO: Fix this
export type Object = Record<
	string,
	string | number | boolean | null | undefined | Object
>;

// export const metadata = {
// 	async get(db: ClientDB.Adapter<unknown>, key: string) {
// 		const { error, data } = await tryCatch(
// 			db.sql<SQL_Schemas.Metadata>`SELECT * FROM client_metadata WHERE key=${`${db.name}:${key}`} LIMIT 1`,
// 		);
// 		if (error) {
// 			if (
// 				error.cause
// 					?.toString()
// 					.endsWith('relation "client_metadata" does not exist')
// 			) {
// 				return null;
// 			}
// 			console.error("Error fetching schema", error);
// 			throw error.cause;
// 		}
// 		return data.rows[0]?.value || null;
// 	},
// 	async set(db: ClientDB.Adapter<unknown>, key: string, value: string) {
// 		await db.sql`INSERT INTO client_metadata (key, value) VALUES (${`${db.name}:${key}`}, ${value})`;
// 	},
// };
