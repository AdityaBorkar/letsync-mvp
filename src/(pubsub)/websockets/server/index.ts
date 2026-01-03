import type { ServerPubSub } from "../../../types/server.ts"
import { generateName } from "../../../utils/generate-name.ts"

export function PubSubServer({ name = generateName() }: { name?: string }) {
  return {
    __brand: "LETSYNC_SERVER_PUBSUB",
    name
    // close: () => Promise.resolve(),
    // syncData,
  } satisfies ServerPubSub.Adapter
}
