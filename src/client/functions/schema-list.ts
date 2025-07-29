import type { Context } from "../config.js";

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
interface ListProps {}

export function SchemaList(props: ListProps, context: Context) {
	console.log({ context, props });
	// TODO - (WRITE LOCK) ENABLE
	// TODO - PUSH WRITE REQUESTS
	// TODO - COLLECT ERRORS (DO NOT DO ANYTHING WITH THEM FOR NOW)
	// TODO - (WRITE LOCK) RELEASE
	// const CurrentVersion = await getSchema(db);
	// const versions = await this.schema.listUpdates(db, CurrentVersion);
}
