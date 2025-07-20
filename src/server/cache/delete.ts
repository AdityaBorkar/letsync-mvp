import type { EndpointContext } from "../index.js";

export default async function cacheDelete(
	request: Request,
	_: EndpointContext,
) {
	const input = await request.json();
	console.log("cacheDelete REQUEST RECEIVED WITH BODY: ", input);

	const response = { ack: true };
	return response;
}
