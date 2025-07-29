import type { ClientPubSub } from "@/types/client.js";
import { generateName } from "@/utils/generate-name.js";
import { syncData } from "./sync-data.js";

export function PubSubClient<T>({
	name = generateName(),
	// method,
}: {
	name?: string;
	method: "ws" | "sse" | "long-polling" | "short-polling";
}) {
	// TODO: Create a pubsub client

	return {
		__brand: "LETSYNC_PUBSUB_CLIENT",
		name,
		syncData,
		close: () => {},
	} as ClientPubSub.Adapter<T>;
}
