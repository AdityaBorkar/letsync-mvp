import type { Context } from "../config.js";

// biome-ignore lint/suspicious/noEmptyInterface: TEMPORARY
interface RegisterProps {
	// TODO - ADD METADATA for { organizationId, projectId }
}

export function DeviceRegister(_: RegisterProps, context: Context) {
	context;
	// const console = new Logger("register");
	// const metadata = context.db.get("metadata");
	// const existingDevice = await metadata?.sql`SELECT * FROM client_metadata WHERE key = "device" LIMIT 1`;
	// console.log({ existingDevice: existingDevice?.rows[0] });
	// const data =
	// 	//  existingDevice
	// 	// 	? await Fetch({
	// 	// 			method: 'GET',
	// 	// 			baseUrl: apiUrl,
	// 	// 			endpoint: '/device',
	// 	// 			searchParams: { deviceId: existingDevice.deviceId },
	// 	// 		})
	// 	// 	:
	// 	await context.fetch("POST", "/device", {});
	// console.log({ data });
	// const { device, schema, pubsub } = data;
	// const { deviceId, userId, isActive } = device;
	// if (!isActive) {
	// 	throw new Error("Device was forcefully logged out");
	// }
	// await metadata.upsert("device", { deviceId, userId });
	// await metadata.upsert("cursor", { location: null });
	// await metadata.upsert("schema", schema);
	// return { deviceId, isActive, pubsub, userId };
}
