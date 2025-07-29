import { sql as drizzle_sql } from "drizzle-orm";

import type { DrizzleServerDb } from "./types.js";

export function sql<T>(
	db: DrizzleServerDb,
	template: TemplateStringsArray | string,
	...args: unknown[]
) {
	if (!args.length) {
		return db.execute(template as string) as unknown;
	}
	return db.execute(drizzle_sql<T>(template as TemplateStringsArray, ...args));
}
