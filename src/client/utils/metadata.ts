import type { ClientDB } from "@/types/client.js";
import type { SQL_Schemas } from "@/types/schemas.js";
import { tryCatch } from "@/utils/try-catch.js";

export const metadata = {
	async get(db: ClientDB.Adapter<unknown>, key: string) {
		const { error, data } = await tryCatch(
			db.sql<SQL_Schemas.Metadata>`SELECT * FROM client_metadata WHERE key=${`${db.name}:${key}`} LIMIT 1`,
		);
		if (error) {
			if (
				error.cause
					?.toString()
					.endsWith('relation "client_metadata" does not exist')
			) {
				return null;
			}
			console.error("Error fetching schema", error);
			throw error.cause;
		}
		return data.rows[0]?.value || null;
	},
	async set(db: ClientDB.Adapter<unknown>, key: string, value: string) {
		await db.sql`INSERT INTO client_metadata (key, value) VALUES (${`${db.name}:${key}`}, ${value})`;
	},
};
