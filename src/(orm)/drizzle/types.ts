import type { PGlite } from "@electric-sql/pglite";
import type { PgliteDatabase } from "drizzle-orm/pglite";

export type DrizzleDB = PgliteDatabase<Record<string, unknown>> & {
	$client: PGlite;
};
