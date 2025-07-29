import { useContext } from "react";

import { SyncContext } from "./SyncProvider.js";

export function useSyncStatus() {
	const client = useContext(SyncContext);
	// TODO: Add a externalUseState hook to update the status
	return client.getStatus();
}
