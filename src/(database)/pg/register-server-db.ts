import type { ServerDB } from "@/types/server.js";

export function registerServerDb<T>({ name, db }: { name: string; db: T }) {
	return {
		__brand: "LETSYNC_SERVER_DB",
		db,
		name,
	} as unknown as ServerDB.Adapter<T>;
}
// import type { Client } from "pg";

// import type { LetsyncConfig } from "@/types/config.js";
// import type { PubSub as ServerPubsub } from "@/types/pubsub.js";
// import type { ServerDB } from "@/types/server.js";

// export function LetsyncServerDb({
// 	name,
// 	// pubsub,
// 	// dbSchema,
// 	database,
// }: {
// 	name: string;
// 	pubsub: ServerPubsub.Adapter<unknown>;
// 	schema: Config["schema"];
// 	database: Client;
// 	// | (() => {
// 	// 		instance: Client;
// 	// 		wrapper: any;
// 	//   });
// }): ServerDB.Adapter<Client> {
// 	// TODO - Connection Pooling on backend

// 	// TODO - MIGRATE / SET SCHEMA

// 	async function waitUntilReady() {
// 		try {
// 			await database.connect();
// 		} catch (error) {
// 			console.warn("Connection warning!");
// 		}
// 	}

// 	return {
// 		__brand: "LETSYNC_SERVER_DB",
// 		db: database,
// 		name,
// 		// query: (query: string) => database.query(query),
// 		// type: "SQL",
// 		// waitUntilReady,
// 	};
// }
