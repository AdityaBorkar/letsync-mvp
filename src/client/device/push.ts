import type { ClientParams } from "../create.js";

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
interface PushProps {}

export function push(props: PushProps, params: ClientParams) {
	console.log({ params, props });
	// TODO - (WRITE LOCK) ENABLE
	// TODO - PUSH WRITE REQUESTS
	// TODO - COLLECT ERRORS (DO NOT DO ANYTHING WITH THEM FOR NOW)
	// TODO - (WRITE LOCK) RELEASE
}
