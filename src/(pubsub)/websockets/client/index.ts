import type { ClientPubSub } from "@/types/client.js"

import { generateName } from "../../../utils/generate-name.js"
import { connect } from "./connect.js"
import { disconnect } from "./disconnect.js"

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
  method: "ws" | "sse" | "long-polling" | "short-polling"
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
    connect: (props) => connect(props, { client, method, wsUrl }),
    disconnect: () => disconnect({ client }),
    name,
    syncItems
  } satisfies ClientPubSub.Adapter
}
