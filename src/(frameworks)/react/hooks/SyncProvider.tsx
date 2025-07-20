// biome-ignore lint/style/useImportType: React
import React, { createContext } from "react";

import type { LetSyncContext } from "@/types/context.js";

export const SyncContext = createContext<LetSyncContext<Request> | null>(null);

export function SyncProvider({
	context,
	children,
}: {
	context: LetSyncContext<Request>;
	children: React.ReactNode;
}) {
	return (
		<SyncContext.Provider value={context}>{children}</SyncContext.Provider>
	);
}
