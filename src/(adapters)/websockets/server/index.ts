import type { ServerPubSub } from "../../../types/server.js"

export function PubSubServer({ name }: { name: string }) {
  throw new Error("PubSubServer is not implemented")
  // biome-ignore lint/correctness/noUnreachable: EXEMPTION
  return {
    __brand: "LETSYNC_SERVER_PUBSUB",
    name
    // close: () => Promise.resolve(),
    // syncData,
  } satisfies ServerPubSub.Adapter
}
