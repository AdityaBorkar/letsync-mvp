import type { Context } from "../config.js";
import { DataSync } from "./data-sync.js";
import { SchemaPull } from "./schema-pull.js";
import { SchemaUpgrade } from "./schema-upgrade.js";

export async function SyncStart(
	props: {
		autoUpgrade?: boolean;
		checkForUpdates?: boolean;
	},
	context: Context,
) {
	const { checkForUpdates = true, autoUpgrade = false } = props;
	try {
		await SchemaPull({ checkForUpdates }, context);
		if (autoUpgrade) {
			await SchemaUpgrade({ latest: true }, context);
		}
		// this.isDbRunning = false;
		// this.isSyncing = false;
		await DataSync(undefined, context);
	} catch (error: unknown) {
		// this.isDbRunning = false;
		// this.isSyncing = false;
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(message);
	}
}
