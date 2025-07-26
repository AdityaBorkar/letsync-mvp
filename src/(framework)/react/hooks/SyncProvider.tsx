// biome-ignore lint/style/useImportType: React
import React, { createContext, useState } from "react";

import type { LetSyncContextClient } from "@/types/context.js";

export type SyncContextType = {
	config: LetSyncContextClient<Request> | null;
	isDbRunning: boolean;
	isSyncing: boolean;
	error: string | null;
	setStatus: (status: {
		isDbRunning: boolean;
		isSyncing: boolean;
		error: string | null;
	}) => void;
	controller: AbortController;
	setController: (controller: AbortController) => void;
};

export const SyncContext = createContext<SyncContextType>({
	config: null,
	controller: new AbortController(),
	error: null,
	isDbRunning: true,
	isSyncing: false,
	setController: () => {},
	setStatus: () => {},
});

export function SyncProvider({
	config,
	children,
}: {
	config: LetSyncContextClient<Request>;
	children: React.ReactNode;
}) {
	const [status, setStatus] = useState<{
		isDbRunning: boolean;
		isSyncing: boolean;
		error: string | null;
	}>({
		error: null,
		isDbRunning: true,
		isSyncing: false,
	});
	const [controller, setController] = useState(new AbortController());

	return (
		<SyncContext
			value={{ config, ...status, controller, setController, setStatus }}
		>
			{children}
		</SyncContext>
	);
}
