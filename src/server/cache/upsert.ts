import type { EndpointContext } from "../index.js";

export default async function cacheUpsert(
	request: Request,
	_: EndpointContext,
) {
	const input = await request.json();
	console.log("cacheUpsert REQUEST RECEIVED WITH BODY: ", input);

	const response = {
		ack: true,
	};
	return response;
}
