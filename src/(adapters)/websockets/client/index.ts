import type { ClientPubSub } from "@/types"

import { connect } from "./methods/connect.js"
import { disconnect } from "./methods/disconnect.js"

export type ClientState = {
  client: WebSocket | null
  get: () => WebSocket | null
  set: (value: WebSocket | null) => void
}

export function PubSubClient({
  name,
  syncItems = {
    db: [],
    fs: []
  },
  wsUrl
}: {
  name: string
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
    connect: (context) => connect({ client, context, wsUrl }),
    disconnect: () => disconnect({ client }),
    name,
    syncItems
  } satisfies ClientPubSub.Adapter
}
