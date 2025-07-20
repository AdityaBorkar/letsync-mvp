export { SyncProvider } from "./context/SyncProvider.js";
export { useDatabase } from "./hooks/useDatabase.js";
export { useSync } from "./hooks/useWebSync.js";

export function LetSyncConfig() {
	const context = {
		db: [],
		fs: [],
		pubsub: null,
	};
	return {
		db: () => {},
		fs: () => {},
		// mutation: (config: { db: any; fs: any; pubsub: any }) => {
		// 	return new MutationBuilder(config);
		// },
		pubsub: () => {},
	};
}
