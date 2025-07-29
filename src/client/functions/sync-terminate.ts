import type { Context } from "../config.js";

export function SyncTerminate(_: undefined, context: Context) {
	for (const [, pubsub] of context.pubsub.entries()) {
		pubsub.close();
	}
	for (const [, fs] of context.fs.entries()) {
		fs.close();
	}
	for (const [, db] of context.db.entries()) {
		db.close();
	}
	context.controller.abort();
}
