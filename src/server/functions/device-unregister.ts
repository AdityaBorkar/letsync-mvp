import type { ServerContext } from "@/types/context.js";

export default async function deviceUnregister(
	request: Request,
	_: ServerContext<Request>,
) {
	const input = await request.json();
	console.log("deviceUnregister REQUEST RECEIVED WITH BODY: ", input);
	// TODO - TERMINATE PUBSUB CONNECTION
	const response = { ack: true };
	return response;
}
