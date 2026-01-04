import type { ClientPubSub } from "@/types/client.js"

import { generateName } from "../../../utils/generate-name.js"
import { connect } from "./methods/connect.js"
import { disconnect } from "./methods/disconnect.js"

export type ClientState = {
  client: WebSocket | null
  get: () => WebSocket | null
  set: (value: WebSocket | null) => void
}

export function PubSubClient({
  name = generateName(),
  syncItems = {
    db: [],
    fs: []
  },
  method,
  wsUrl
}: {
  name?: string
  method: "ws" | "sse" | "long-polling" | "short-polling" | "upgrade-to-ws"
  syncItems?: {
    db: string[]
    fs: string[]
  }
  wsUrl?: string
}) {
  const client: ClientState = {
    client: null,
    get() {
      return this.client
    },
    set(value: any) {
      this.client = value
    }
  }
  return {
    __brand: "LETSYNC_CLIENT_PUBSUB",
    connect: (context) => connect({ client, context, method, wsUrl }),
    disconnect: () => disconnect({ client }),
    name,
    syncItems
  } satisfies ClientPubSub.Adapter
}
