import type { ServerPubSub } from "@/types/server.js";

export function PubSubServer() {
	return {
		__brand: "LETSYNC_PUBSUB_SERVER",
		// close: () => {},
		// syncData,
	} as ServerPubSub.Adapter<unknown>;
}
