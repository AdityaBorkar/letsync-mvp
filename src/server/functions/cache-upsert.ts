import type { Context } from "../config.js";

export default async function cacheUpsert(request: Request, _: Context) {
	const input = await request.json();
	console.log("cacheUpsert REQUEST RECEIVED WITH BODY: ", input);

	const response = {
		ack: true,
	};
	return response;
}
