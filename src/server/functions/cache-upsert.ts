import type { ServerContext } from "@/types/context.js";

export default async function cacheUpsert(
	request: Request,
	_: ServerContext<Request>,
) {
	const input = await request.json();
	console.log("cacheUpsert REQUEST RECEIVED WITH BODY: ", input);

	const response = {
		ack: true,
	};
	return response;
}
