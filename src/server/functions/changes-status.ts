import type { Context } from "../config.js";

export default async function changesStatus(request: Request, _: Context) {
	const input = await request.json();
	console.log("changesStatus REQUEST RECEIVED WITH BODY: ", input);

	const response = {
		ack: true,
	};
	return response;
}
