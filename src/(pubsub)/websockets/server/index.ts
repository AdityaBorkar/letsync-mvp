import type { ServerPubSub } from "../../../types/server.js"
import { generateName } from "../../../utils/generate-name.js"

export function PubSubServer({ name = generateName() }: { name?: string }) {
  return {
    __brand: "LETSYNC_SERVER_PUBSUB",
    name
    // close: () => Promise.resolve(),
    // syncData,
  } satisfies ServerPubSub.Adapter
}
