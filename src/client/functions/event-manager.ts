import type { ClientEvents } from "@/types/client-events.js";

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
