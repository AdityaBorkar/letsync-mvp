import type { DrizzleDB } from "../types.js";

export function close(client: DrizzleDB) {
	const { $client } = client;
	if ("close" in $client) {
		return $client.close() as unknown as Promise<void>;
	} else if ("end" in $client) {
		// @ts-expect-error
		return $client.end() as unknown as Promise<void>;
	}
	throw new Error(
		".close() is not supported by the Database Client. Kindly raise a GitHub Issue [INSERT PRE-FILLED DATA HERE].",
	);
}
