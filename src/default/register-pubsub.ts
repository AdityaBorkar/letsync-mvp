import type { PubSub } from "@/types/pubsub.js";

export function registerPubSub<T>({
	name,
	pubsub,
}: {
	name: string;
	pubsub: T;
}) {
	return { __brand: "LETSYNC_PUBSUB", name, pubsub } as PubSub.Adapter<T>;
}
