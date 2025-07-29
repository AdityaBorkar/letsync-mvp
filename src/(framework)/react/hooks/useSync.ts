import { useContext } from "react";

import { SyncContext } from "./SyncProvider.js";

export function useSync() {
	const client = useContext(SyncContext);
	return client;
}
