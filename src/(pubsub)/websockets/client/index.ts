import type { ClientPubSub } from "@/types/client.js"

import { generateName } from "../../../utils/generate-name.js"

export function PubSubClient({
  name = generateName()
  // method,
}: {
  name?: string
  method: "ws" | "sse" | "long-polling" | "short-polling"
}) {
  // TODO: Create a pubsub client

  return {
    __brand: "LETSYNC_CLIENT_PUBSUB",
    close: () => Promise.resolve(),
    name
    // syncData,
  } satisfies ClientPubSub.Adapter
}
