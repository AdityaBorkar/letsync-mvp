import type { LetSyncContext } from "@/types/context.js";

export default async function changesAdd(
	request: Request,
	_: LetSyncContext<Request>,
) {
	const input = await request.json();
	console.log("changesAdd REQUEST RECEIVED WITH BODY: ", input);

	const response = {
		ack: true,
	};
	return response;
}
