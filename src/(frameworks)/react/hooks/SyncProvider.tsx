// biome-ignore lint/style/useImportType: React
import React, { createContext, useState } from "react";

import type { LetSyncContext } from "@/types/context.js";

export const SyncContext = createContext<{
	config: LetSyncContext<Request> | null;
	isPending: boolean;
	isSyncing: boolean;
	error: string | null;
	setStatus: (status: {
		isPending: boolean;
		isSyncing: boolean;
		error: string | null;
	}) => void;
}>({
	config: null,
	error: null,
	isPending: true,
	isSyncing: false,
	setStatus: () => {},
});

export function SyncProvider({
	config,
	children,
}: {
	config: LetSyncContext<Request>;
	children: React.ReactNode;
}) {
	const [status, setStatus] = useState<{
		isPending: boolean;
		isSyncing: boolean;
		error: string | null;
	}>({
		error: null,
		isPending: true,
		isSyncing: false,
	});

	console.log({ status });

	return (
		<SyncContext value={{ config, ...status, setStatus }}>
			{children}
		</SyncContext>
	);
}
