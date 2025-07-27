import type { SyncContextType } from "@/(framework)/react/hooks/SyncProvider.js";

export async function syncData(context: SyncContextType) {
	const SYNC_START_START = performance.now();
	const { setStatus } = context;

	// TODO: Implement syncData

	setStatus({ error: null, isDbRunning: false, isSyncing: true });
	const SYNC_START_END = performance.now();
	console.log(`Sync started in ${SYNC_START_END - SYNC_START_START}ms`);
}
