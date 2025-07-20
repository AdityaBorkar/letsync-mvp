// import { useEffect, useState } from "react";

// import { Logger } from "@/utils/logger.js";

// const logger = new Logger("SYNC");

// type SyncState = {
// 	isPending: boolean;
// 	isSyncing: boolean;
// 	error: string | null;
// };

// export function useSync({
// 	databases,
// 	method = "websocket",
// 	server,
// }: {
// 	databases: DatabaseListType;
// 	server: {
// 		endpoint: string;
// 		https: boolean;
// 	};
// 	method: SyncMethods;
// }) {
// 	const [sync, setSync] = useState<SyncState>({
// 		error: null,
// 		isPending: true,
// 		isSyncing: false,
// 	});

// 	useEffect(() => {
// 		const controller = new AbortController();
// 		const _PerfStart = performance.now();

// 		if (method === "websocket") {
// 			syncData_WS({ databases, server, signal: controller.signal })
// 				.then(() => {
// 					setSync({ error: null, isPending: false, isSyncing: true });
// 					const _PerfEnd = performance.now();
// 					logger.log(`Sync data took ${_PerfEnd - _PerfStart}ms`);
// 				})
// 				.catch((error) => {
// 					setSync({ error: error.message, isPending: false, isSyncing: false });
// 				});
// 		}

// 		if (method === "http-short-polling") {
// 			throw new Error("Not implemented");
// 		}

// 		if (method === "sse") {
// 			throw new Error("Not implemented");
// 		}

// 		return () => controller.abort();
// 	}, [databases, method, server]);

// 	return sync;
// }

// // ('use client');

// // import { useContext } from 'react';

// // import { LetsyncContext } from '../context.js';

// // /**
// //  * A React hook that provides access to the Letsync context.
// //  *
// //  * @returns {Object} An object containing:
// //  *   - database: The Letsync database instance for data management
// //  *   - pubsub: The publish/subscribe messaging system for real-time communication
// //  * 	 - fs: Filesystem
// //  *
// //  */
// // export function useLetsync() {
// // 	const { db, fs, pubsub } = useContext(LetsyncContext);
// // 	return { db, fs, pubsub };
// // }
