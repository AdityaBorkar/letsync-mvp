import { $fetch } from "@/utils/$fetch.js";

import type { ClientParams } from "../functions/create.js";

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
interface RegisterProps {
	// TODO - ADD METADATA for { organizationId, projectId }
}

export async function register(props: RegisterProps, params: ClientParams) {
	props;
	const logs = console; // Logger({ fn: "register" });

	const { apiBasePath } = params.config;
	const { metadata } = params.stores;

	const existingDevice = await metadata.get("device");
	logs.debug({ existingDevice });

	const data =
		//  existingDevice
		// 	? await Fetch({
		// 			method: 'GET',
		// 			baseUrl: apiUrl,
		// 			endpoint: '/device',
		// 			searchParams: { deviceId: existingDevice.deviceId },
		// 		})
		// 	:
		await $fetch({
			baseUrl: apiBasePath || "",
			endpoint: "/device",
			method: "POST",
		});
	logs.debug({ data });

	// @ts-ignore
	const { device, schema, pubsub } = data;
	const { deviceId, userId, isActive } = device;

	if (!isActive) {
		throw new Error("Device was forcefully logged out");
	}

	await metadata.upsert("device", { deviceId, userId });
	await metadata.upsert("cursor", { location: null });
	await metadata.upsert("schema", schema);

	return { deviceId, isActive, pubsub, userId };
}
