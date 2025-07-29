// TODO: HANDLE MIGRATION SCRIPTS IN THE CLOUD AND EXECUTE ONLY CALLS OVER HERE. MAKE SURE THEY ARE IDEMPOTENT.

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
