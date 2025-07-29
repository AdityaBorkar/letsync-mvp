import type { DrizzleDB } from "../types.js";

export async function start(client: DrizzleDB) {
	const { $client } = client;
	if ("waitReady" in $client) {
		return $client.waitReady;
	}
	throw new Error(
		".start() is not supported by the Database Client. Kindly raise a GitHub Issue [INSERT PRE-FILLED DATA HERE].",
	);
}
