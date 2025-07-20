import type { LetSyncContext } from "@/types/context.js";

export default async function cacheUpsert(
	request: Request,
	_: LetSyncContext<Request>,
) {
	const input = await request.json();
	console.log("cacheUpsert REQUEST RECEIVED WITH BODY: ", input);

	const response = {
		ack: true,
	};
	return response;
}
