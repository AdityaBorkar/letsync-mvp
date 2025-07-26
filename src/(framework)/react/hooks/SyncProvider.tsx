// biome-ignore lint/style/useImportType: React
import React, { createContext, useState } from "react";

import type { LetSyncContextClient } from "@/types/context.js";

export type SyncContextType = {
	config: LetSyncContextClient<Request> | null;
	isPending: boolean;
	isSyncing: boolean;
	error: string | null;
	setStatus: (status: {
		isPending: boolean;
		isSyncing: boolean;
		error: string | null;
	}) => void;
	controller: AbortController;
	setController: (controller: AbortController) => void;
	// TODO: Add to `schema`
	// const schema = {
	// 	columns: {
	// 		client_metadata: "client_metadata",
	// 	},
	// };
};

export const SyncContext = createContext<SyncContextType>({
	config: null,
	controller: new AbortController(),
	error: null,
	isPending: true,
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
		isPending: boolean;
		isSyncing: boolean;
		error: string | null;
	}>({
		error: null,
		isPending: true,
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
