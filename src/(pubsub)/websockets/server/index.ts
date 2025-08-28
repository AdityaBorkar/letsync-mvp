import type { ServerPubSub } from "@/types/server.js"

export function PubSubServer() {
  return {
    __brand: "LETSYNC_SERVER_PUBSUB",
    name: "pubsub"
    // close: () => Promise.resolve(),
    // syncData,
  } satisfies ServerPubSub.Adapter
}
