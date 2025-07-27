import { $fetch } from "@/utils/$fetch.js";

// import { Logger } from "@/utils/logger.js";

import type { ClientParams } from "../create.js";

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
interface DeregisterProps {
	// TODO - DE-REGISTER OTHER DEVICES
}

export async function deregister(props: DeregisterProps, params: ClientParams) {
	props;
	const logs = console; // Logger({ fn: "deregister" });

	const { metadata } = params.stores;
	const { api } = params.config;

	const existingDevice = await metadata.get("device");
	logs.debug({ existingDevice });

	const data = await $fetch({
		baseUrl: api.basePath,
		endpoint: "/device",
		method: "DELETE",
		searchParams: { deviceId: existingDevice?.deviceId },
	});
	logs.debug({ data });

	if (!data.ack) {
		throw new Error("Failed to deregister device");
	}

	await metadata.remove("device");
}
