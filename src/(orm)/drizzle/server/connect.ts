import type { DrizzleServerDb } from "./index.js"

export function connect(client: DrizzleServerDb) {
  const { $client } = client

  if ("waitReady" in $client) {
    return $client.waitReady as unknown as Promise<void>
  }
  if ("connect" in $client) {
    return $client.connect() as unknown as Promise<void>
  }

  throw new Error(
    ".connect() is not supported by the Database Client. Kindly raise a GitHub Issue [INSERT PRE-FILLED DATA HERE]."
  )
}
