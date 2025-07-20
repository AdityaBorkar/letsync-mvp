import type { LetSyncContext } from "@/types/context.js";

export default async function databaseInit(
	request: Request,
	_: LetSyncContext<Request>,
) {
	const input = await request.json();

	// TODO - CHANGEFEED CREATION AND SCHEMA MIGRATIONS

	console.log("databaseInit REQUEST RECEIVED WITH BODY: ", input);

	const response = { ack: true };
	return response;
}
