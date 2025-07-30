import type { DrizzleClientDb } from "./types.js";

export function dump(
	client: DrizzleClientDb,
	{ compression }: { compression: "auto" | "gzip" | "none" },
): Promise<File | Blob> {
	const { $client } = client;
	if ("dumpDataDir" in $client) {
		return $client.dumpDataDir(compression);
	}
	throw new Error(
		".dump() is not supported by the Database Client. Kindly raise a GitHub Issue [INSERT PRE-FILLED DATA HERE].",
	);
}
