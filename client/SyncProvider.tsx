import { createContext } from "react";

import { useSync } from "#letsync/client/useSync";
import type { DatabaseListType } from "#letsync/types";

export function SyncProvider({
	databases,
	method = "websocket",
	server,
	children,
}: {
	databases: DatabaseListType;
	method: "websocket" | "webtransport" | "http-short-polling" | "sse";
	server: {
		endpoint: string;
		https: boolean;
	};
	children: React.ReactNode;
}) {
	const sync = useSync({ databases, method, server });
	return <SyncContext value={sync}>{children}</SyncContext>;
}

export const SyncContext = createContext<ReturnType<typeof useSync>>({
	error: null,
	isPending: true,
	isSyncing: false,
});
