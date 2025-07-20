import type { ServerDB } from "@/types/server.js";

export function registerServerDb<T>({ name, db }: { name: string; db: T }) {
	return {
		__brand: "LETSYNC_SERVER_DB",
		db,
		name,
	} as unknown as ServerDB.Adapter<T>;
}
