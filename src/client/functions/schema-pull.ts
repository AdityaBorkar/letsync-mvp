import { Logger } from "@/utils/logger.js";
import { tryCatch } from "@/utils/try-catch.js";
import type { Context } from "../config.js";
import { getSchema } from "../utils/schema.js";

// import { Fetch } from '@/util/Fetch.js';

export async function SchemaPull(
	{ checkForUpdates }: { checkForUpdates?: boolean },
	context: Context,
) {
	for (const [, db] of context.db.entries()) {
		const DB_INIT_START = performance.now();
		try {
			const console = new Logger(`DB:${db.name}`, "#ff0"); // TODO: Different color for each db
			console.log("DB", db);

			const CurrentVersion = await getSchema(db);
			console.log("Current Schema", CurrentVersion);

			if (CurrentVersion && !checkForUpdates) {
				console.log("Skipping Update Check");
				return;
			}
			const schema = await tryCatch(
				context.fetch("GET", "/schema", {
					searchParams: CurrentVersion
						? { from: CurrentVersion, name: db.name }
						: { name: db.name },
				}),
			);
			// @ts-expect-error FIX THIS
			if (schema.error || schema.data.error) {
				// @ts-expect-error FIX THIS
				const error = schema.error || schema.data.error;
				console.error("Error fetching schema", error);
				throw error;
			}
			console.log("Latest Schema", schema.data);
			// @ts-expect-error FIX THIS
			await insertSchemas(db, schema.data);
			// Auto Upgrade
			// @ts-expect-error FIX THIS
			const LatestVersion = schema.data[0]?.version;
			if (CurrentVersion > LatestVersion) {
				throw new Error(
					"Database is corrupted. Current Version is greater than Latest Version.",
				);
			}
		} catch (error: unknown) {
			throw new Error(error instanceof Error ? error.message : String(error));
		} finally {
			const DB_INIT_END = performance.now();
			console.log(`Database initialized in ${DB_INIT_END - DB_INIT_START}ms`);
		}
	}

	// const { apiUrl, database, metadata } = superProps;
	// if (WRITE_LOCK) {
	// 	console.log("FAILED - WRITE LOCK IS ENABLED.");
	// 	return;
	// }
	// WRITE_LOCK = true;

	// TODO - STORE CURSOR INDEPENDENTLY OUT OF THE DEVICE
	// const cursor =
	// 	await db.sql<CursorRecord>`SELECT * FROM metadata WHERE name = 'cursor'`;
	// console.log({ cursor });

	// const CdcList = await fetcher(
	// 	`${apiUrl}/changes?cursor=${cursor}`,
	// 	"GET",
	// );

	// const CacheList = "DOWNLOAD CACHE PARALLEL";

	// let newCursor = cursor;
	// for (const cdc of CdcList) {
	// 	// TODO: Perform Operations Sequentially
	// 	// if (cdc.type === "record") {
	// 	// 	// db.push(cdc);
	// 	// 	continue;
	// 	// }
	// 	// const cache = fetcher(`CACHE-URL-S3`, "GET");
	// 	// TODO - OPERATIONS: `CACHE`
	// 	newCursor = cdc.cursor;
	// }

	// await db.sql`UPDATE metadata SET lastUpdated = ${newCursor} WHERE name = 'device'`;
	// TODO - (WRITE LOCK) RELEASE
}
