// biome-ignore lint/style/useImportType: REACT
import React from "react";

import type { LetSyncClient } from "@/client/config.js";

import { SyncContext } from "./context.js";

export function SyncProvider({
	client,
	children,
}: {
	client: ReturnType<typeof LetSyncClient>;
	children: React.ReactNode;
}) {
	return <SyncContext value={client}>{children}</SyncContext>;
}
