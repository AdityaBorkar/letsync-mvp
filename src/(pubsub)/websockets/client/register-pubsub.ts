import type { ClientPubSub } from "@/types/~pubsub.js";

import { syncData } from "./sync-data.js";

export function registerPubSub<T>({
	name,
	pubsub,
}: {
	name: string;
	pubsub: T;
}) {
	return {
		__brand: "LETSYNC_PUBSUB_CLIENT",
		name,
		pubsub,
		syncData,
	} as ClientPubSub.Adapter<T>;
}
