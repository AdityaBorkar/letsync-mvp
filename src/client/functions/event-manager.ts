namespace ClientEvents {
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

export const events = ["device:register", "device:unregister"];

export function EventManager() {
	const subscribers: Map<
		ClientEvents.Name,
		Set<(event: ClientEvents.List[ClientEvents.Name]) => void>
	> = new Map();

	return {
		subscribe: <EventName extends ClientEvents.Name>(
			event: EventName,
			callback: (event: ClientEvents.List[EventName]) => void,
		) => {
			if (!subscribers.has(event)) {
				subscribers.set(event, new Set());
			}
			subscribers.get(event)!.add(callback);
			return () => {
				subscribers.get(event)!.delete(callback);
			};
		},
		// unsubscribe: <
		// 	Callback extends (event: ClientEvents.List[ClientEvents.Name]) => void,
		// >(
		// 	event: ClientEvents.Name,
		// 	callback: Callback,
		// ) => {
		// 	subscribers.get(event)?.delete(callback);
		// },
	};
}
