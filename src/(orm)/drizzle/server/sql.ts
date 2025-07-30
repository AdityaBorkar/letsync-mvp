import { sql as drizzleSql } from "drizzle-orm";

import type { DrizzleServerDb } from "./types.js";

export function sql<T>(
	db: DrizzleServerDb,
	template: TemplateStringsArray | string,
	...args: unknown[]
) {
	if (args.length === 0) {
		return db.execute(template as string) as unknown;
	}
	return db.execute(drizzleSql<T>(template as TemplateStringsArray, ...args));
}
