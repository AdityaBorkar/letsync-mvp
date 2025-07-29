import type { Context } from "../config.js";

export default async function changesAdd(request: Request, _: Context) {
	const input = await request.json();
	console.log("changesAdd REQUEST RECEIVED WITH BODY: ", input);

	const response = {
		ack: true,
	};
	return response;
}
