// import type { PGliteOptions } from "@electric-sql/pglite";
// import { PGlite } from "@electric-sql/pglite";
// import type { ClientDB, ClientPubsub, LetSyncConfig } from "@letsync/core";

// // import type { OrmFunction } from "@/types/OrmFunction.js";

// import { buildSchema } from "./buildSchema.js";
// import { close } from "./close.js";
// import exportData from "./exportData.js";
// import { flush } from "./flush.js";
// import getStorageMetrics from "./getStorageMetrics.js";
// import { open } from "./open.js";
// import { sql } from "./sql.js";

// type Schema = null;

// interface createDBConfig {
// 	name: string;
// 	// orm?: OrmFunction;
// 	// TODO: EVENT HANDLERS AND UPDATES HANDLERS
// }

// export function createDB(
// 	config: createDBConfig,
// 	props?: PGlite | PGliteOptions,
// ): ClientDB.CreateAdapter<PGlite> {
// 	const { name } = config;
// 	const dbClient = props instanceof PGlite ? props : new PGlite(props);
// 	const { schema } = config.orm ? config.orm(dbClient) : { schema: null };

// 	return ({
// 		pubsub,
// 		config,
// 	}: {
// 		pubsub: ClientPubsub.Adapter;
// 		config: LetSyncConfig;
// 	}) => {
// 		console.log({ config, pubsub });
// 		return {
// 			__brand: "LETSYNC_CLIENT_DATABASE",
// 			buildSchema: (schema: Schema) =>
// 				buildSchema({ client: dbClient, schema }),
// 			client: dbClient,
// 			close: () => close(dbClient),
// 			exportData: (options: Parameters<typeof exportData>[1]) =>
// 				exportData({ client: dbClient, schema }, options),
// 			flush: () => flush(dbClient),
// 			name,
// 			open: () => open(dbClient),
// 			sql: <T>(...props: Parameters<typeof dbClient.sql>) =>
// 				sql<T>({ client: dbClient, schema }, ...props),
// 			storageMetrics: () => getStorageMetrics(dbClient),
// 		};
// 	};
// }
