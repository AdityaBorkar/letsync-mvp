export namespace ClientEvents {
	export type List = {
		online: () => void;
		offline: () => void;
		syncing: () => void;
		synced: () => void;
		dbRunning: () => void;
		dbStopped: () => void;
		// "auth.grant": (data: { userId: string; deviceId: string }) => void;
		// "auth.refresh": (data: { userId: string; deviceId: string }) => void;
		// "auth.revoke": (data: { userId: string; deviceId: string }) => void;
		"device:register": () => void;
		"device:deregister": () => void;
		"device:connected": () => void;
		"device:disconnected": () => void;
		"^pull": () => void;
		"^push": () => void;
		"^sync": () => void;
	};

	export type Name = keyof List;
}
