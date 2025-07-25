import { $fetch } from "@/utils/$fetch.js";

import type { ClientParams } from "../functions/create.js";

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
interface CheckForUpdatesProps {}

export async function checkForUpdates(
	props: CheckForUpdatesProps,
	params: ClientParams,
) {
	props;
	const logs = console; // Logger({ fn: "checkForUpdates" });

	const { stores } = params;
	const { metadata } = stores;
	const { apiBasePath } = params.config;

	const schema = await metadata.get("schema");
	logs.debug({ schema });

	const SchemaVersions = await $fetch({
		baseUrl: apiBasePath || "",
		endpoint: "/schema",
		method: "GET",
	});
	console.log({ SchemaVersions });
	logs.debug({ SchemaVersions });

	// TODO - STORE SCHEMA IN DATABASE
	const upgrades = [];
	// const upgrades = SchemaVersions.versions
	// 	.reduce((acc, version) => {
	// 		if (version > schema?.version) {
	// 			acc.push(version);
	// 		}
	// 		return acc;
	// 	}, [] as number[])
	// 	.sort((a, b) => a - b);

	return upgrades.length > 0;
}
