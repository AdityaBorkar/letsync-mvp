import type { SyncContextType } from "@/(framework)/react/index.js";

export async function terminate(name: string, context: SyncContextType) {
	const { config, controller, setController, isDbRunning: isPending } = context;

	if (isPending || !config) {
		console.log(
			"Database have not been initialized yet. Kindly Run `start` first.",
		);
		return;
	}

	// pubsub.disconnect();
	console.log("Terminating database: ", name);
	// filesystem.close();
	// device.deregister();

	controller.abort();
	setController(new AbortController());
}
