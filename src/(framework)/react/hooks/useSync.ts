import { useContext } from "react";

import { start, terminate, upgrade } from "@/client/index.js";

import { SyncContext } from "./SyncProvider.js";

export function useSync() {
	const ctx = useContext(SyncContext);
	return {
		start: (params: Parameters<typeof start>[0]) => start(params, ctx),
		terminate: (params: Parameters<typeof terminate>[0]) =>
			terminate(params, ctx),
		upgrade: (params: Parameters<typeof upgrade>[0]) => upgrade(params, ctx),
	};
}
