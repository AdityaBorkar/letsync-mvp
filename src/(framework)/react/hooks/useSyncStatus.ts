import { useContext, useEffect, useState } from "react";

import { SyncContext } from "./SyncProvider.js";

export enum NetworkStatus {
	Online = 1,
	Offline = 0,
}

export function useSyncStatus() {
	const { isDbRunning: isPending, isSyncing, error } = useContext(SyncContext);
	const [networkState, setNetworkState] = useState<NetworkStatus>(
		"online" in navigator
			? navigator.onLine
				? NetworkStatus.Online
				: NetworkStatus.Offline
			: NetworkStatus.Online,
	);
	const isOffline = networkState === NetworkStatus.Offline;

	useEffect(() => {
		setNetworkState(
			navigator.onLine ? NetworkStatus.Online : NetworkStatus.Offline,
		);

		const handleOnline = () => {
			setNetworkState(NetworkStatus.Online);
		};
		const handleOffline = () => {
			setNetworkState(NetworkStatus.Offline);
		};
		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	return { error, isOffline, isPending, isSyncing };
}
