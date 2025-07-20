import type { ClientDB } from "@/types/client.js";

export function registerClientDb<T>({ name, db }: { name: string; db: T }) {
	return {
		__brand: "LETSYNC_CLIENT_DB",
		db,
		name,
	} as unknown as ClientDB.Adapter<T>;
}
