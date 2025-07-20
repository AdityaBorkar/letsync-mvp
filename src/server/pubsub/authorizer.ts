import type { LetSyncContext } from "@/types/context.js";

export default async function pubsubAuthorizer(
	request: Request,
	context: LetSyncContext<Request>,
) {
	// const input = await request.json();
	const response = await context.auth(request); // pubsub.authFn(input.token);
	return new Response(JSON.stringify(response));
}
