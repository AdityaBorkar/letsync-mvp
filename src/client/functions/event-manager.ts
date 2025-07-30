export type Events = {
	"network:offline": () => void;
	"network:online": () => void;
	"sync:start": () => void;
	"sync:stop": () => void;
	"db:start": () => void;
	"db:stop": () => void;
	"fs:start": () => void;
	"fs:stop": () => void;
	// "auth.grant": (data: { userId: string; deviceId: string }) => void;
	// "auth.refresh": (data: { userId: string; deviceId: string }) => void;
	// "auth.revoke": (data: { userId: string; deviceId: string }) => void;
	// "device:register": () => void;
	// "device:deregister": () => void;
	// "device:connected": () => void;
	// "device:disconnected": () => void;
	// "^pull": () => void;
	// "^push": () => void;
	// "^sync": () => void;
};

export type EventName = keyof Events;

export function EventManager() {
	const subscribers: Map<
		EventName,
		Set<(event: Events[EventName]) => void>
	> = new Map();

	return {
		subscribe: <E extends EventName>(
			event: E | E[],
			callback: (event: Events[E]) => void,
		) => {
			const events = Array.isArray(event) ? event : [event];
			for (const event of events) {
				if (!subscribers.has(event)) {
					subscribers.set(event, new Set());
				}
				subscribers.get(event)?.add(callback);
			}
			return () => {
				for (const event of events) {
					subscribers.get(event)?.delete(callback);
				}
			};
		},
		unsubscribe: <E extends EventName>(
			callback: (event: Events[E]) => void,
		) => {
			for (const [, callbacks] of subscribers.entries()) {
				callbacks.delete(callback);
			}
		},
	};
}
