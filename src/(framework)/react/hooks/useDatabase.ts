import { useContext } from "react";

import { SyncContext } from "./SyncProvider.js";

export function useDatabase({ name }: { name?: string } = {}) {
	const { config } = useContext(SyncContext);
	if (!config) {
		throw new Error("No database configured");
	}
	if (!name && config.db.size !== 1) {
		throw new Error(
			"Kindly specify a database name or ensure there is only one database configured.",
		);
	}
	const clientDb = name ? config.db.get(name) : config.db.values().next().value;
	if (!clientDb) {
		throw new Error(`Database "${name}" not found`);
	}

	// TODO: Auto type completion for `clientDb.client`
	// TODO: DATABASE RELATED FEATURES:
	// subscribe()
	// write()
	// read()
	// delete()
	return clientDb.client;
}
