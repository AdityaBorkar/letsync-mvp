import type { ClientParams } from "../create.js";

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
interface FlushProps {}

export async function flush(props: FlushProps, params: ClientParams) {
	props;
	params;
}
