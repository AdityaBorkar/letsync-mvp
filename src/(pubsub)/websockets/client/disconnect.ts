import type { ClientState } from "./index.js"

export function disconnect({ client }: { client: ClientState }) {
  console.log("Disconnect websocket")
  const ws = client.get()
  if (!ws) {
    console.log("No websocket connection found")
    return
  }
  ws.close()
  return
}
