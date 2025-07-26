import { useContext } from "react";

import { start } from "@/client/db/start.js";
import { terminate } from "@/client/db/terminate.js";
import { upgrade } from "@/client/db/upgrade.js";

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
