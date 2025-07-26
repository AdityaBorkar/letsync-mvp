import type { DrizzleDB } from "../types.js";

export function close(client: DrizzleDB) {
	if ("close" in client) {
		// @ts-expect-error
		return client.close() as unknown as Promise<void>;
	} else if ("end" in client) {
		// @ts-expect-error
		return client.end() as unknown as Promise<void>;
	}
	throw new Error(
		"Closing is not supported by the Database Client. Kindly raise a GitHub Issue.",
	);
}
