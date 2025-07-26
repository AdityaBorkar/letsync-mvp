import { sql } from "drizzle-orm";
import type { PgliteDatabase } from "drizzle-orm/pglite";

import type { ClientDB } from "@/types/client.js";

export function registerClientDb<T extends PgliteDatabase>({
	name,
	client,
}: {
	name: string;
	client: T;
}) {
	return {
		__brand: "LETSYNC_CLIENT_DB",
		client,
		name,
		sql(template: TemplateStringsArray, ...args: unknown[]) {
			return client.execute(sql(template, ...args));
		},
	} as ClientDB.Adapter<T>;
}
