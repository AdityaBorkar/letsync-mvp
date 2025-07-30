import type { DrizzleClientDb } from "./types.js";

export function connect(client: DrizzleClientDb) {
	const { $client } = client;
	if ("waitReady" in $client) {
		return $client.waitReady;
	}
	throw new Error(
		".start() is not supported by the Database Client. Kindly raise a GitHub Issue [INSERT PRE-FILLED DATA HERE].",
	);
}
