// import type { ServerPubSub } from "@/types/server.js";

// // import {
// // 	IoTDataPlaneClient,
// // 	PublishCommand,
// // } from "@aws-sdk/client-iot-data-plane";

// // import { PubSubAuthorizer } from "./authorizer.js";

// export function PubSub({
// 	prefix,
// 	secret,
// }: {
// 	prefix: string;
// 	secret: string;
// }): ServerPubSub.Adapter<unknown> {
// 	// const client = new IoTDataPlaneClient();

// 	// async function publish(
// 	// 	topic: string,
// 	// 	payload: {
// 	// 		// biome-ignore lint/suspicious/noExplicitAny: TEMPORARY
// 	// 		[key: string]: any;
// 	// 	},
// 	// ) {
// 	// 	const command = new PublishCommand({
// 	// 		payload: Buffer.from(JSON.stringify(payload)),
// 	// 		topic: `${prefix}/letsync/${topic}`,
// 	// 	});
// 	// 	const response = await client.send(command);
// 	// 	console.log({ response });
// 	// }

// 	// // biome-ignore lint/suspicious/noExplicitAny: TEMPORARY
// 	// async function subscribe(topic: string, callback: (data: any) => void) {
// 	// 	// TODO - WRITE THIS CODE
// 	// 	console.log({ callback, prefix, topic });
// 	// 	throw new Error("Not implemented. Contact maintainers.");
// 	// 	// server.subscribe("src/subscriber.handler", {
// 	// 	// 	filter: `${$app.name}/${$app.stage}/chat/room1`,
// 	// 	// });
// 	// }

// 	console.log({ prefix, secret });

// 	return {
// 		__brand: "LETSYNC_PUBSUB",
// 		// authFn: PubSubAuthorizer({ prefix, secret }),
// 		// publish,
// 		// secret,
// 		// subscribe,
// 	} as unknown as ServerPubSub.Adapter<unknown>;
// }
