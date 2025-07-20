import type { EndpointContext } from "../../server/index.js";

export default async function deviceUnregister(
	request: Request,
	params: EndpointContext,
) {
	const input = await request.json();
	console.log("deviceUnregister REQUEST RECEIVED WITH BODY: ", input);
	// TODO - TERMINATE PUBSUB CONNECTION
	const response = { ack: true };
	return response;
}
