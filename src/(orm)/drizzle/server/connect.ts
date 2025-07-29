import type { DrizzleServerDb } from "./types.js";

export function connect(client: DrizzleServerDb) {
	const { $client } = client;
	if ("connect" in $client) {
		return $client.connect() as unknown as Promise<void>;
	}
	throw new Error(
		".connect() is not supported by the Database Client. Kindly raise a GitHub Issue [INSERT PRE-FILLED DATA HERE].",
	);
}
