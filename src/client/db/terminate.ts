import type { SyncContextType } from "@/(framework)/react/index.js";

export async function terminate(name: string, context: SyncContextType) {
	const { config, controller, setController, isPending } = context;

	if (isPending || !config) {
		console.log(
			"Database have not been initialized yet. Kindly Run `start` first.",
		);
		return;
	}

	console.log("Terminating database: ", name);

	controller.abort();
	setController(new AbortController());
}
