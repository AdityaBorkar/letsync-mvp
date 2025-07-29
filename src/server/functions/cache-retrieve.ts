import type { ServerContext } from "@/types/context.js";

export default async function cacheRetrieve(
	request: Request,
	_: ServerContext<Request>,
) {
	const input = await request.json();
	console.log("cacheRetrieve REQUEST RECEIVED WITH BODY: ", request);
	console.log("cacheRetrieve REQUEST RECEIVED WITH BODY: ", input);

	const response = {
		ack: true,
	};
	return response;
}
