import type { Context } from "../config.js";

export function DataSync(_: undefined, context: Context) {
	context.status.isSyncing.set(true);
}
