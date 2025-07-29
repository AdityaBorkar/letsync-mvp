import type { DrizzleServerDb } from "./types.js";

export function close(client: DrizzleServerDb) {
	const { $client } = client;
	if ("close" in $client) {
		// @ts-expect-error
		return $client.close() as unknown as Promise<void>;
	} else if ("end" in $client) {
		return $client.end() as unknown as Promise<void>;
	}
	throw new Error(
		".close() is not supported by the Database Client. Kindly raise a GitHub Issue [INSERT PRE-FILLED DATA HERE].",
	);
}
