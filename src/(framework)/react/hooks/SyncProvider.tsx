// biome-ignore lint/style/useImportType: REACT
import React, { createContext } from "react";

import type { LetSyncClient } from "@/client/config.js";

type Client = ReturnType<typeof LetSyncClient>;

export const SyncContext = createContext<Client>(null as unknown as Client);

export function SyncProvider({
	client,
	children,
}: {
	client: Client;
	children: React.ReactNode;
}) {
	return <SyncContext value={client}>{children}</SyncContext>;
}
