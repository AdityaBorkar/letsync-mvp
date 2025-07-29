import { sql } from "drizzle-orm";

import type { DrizzleClientDb } from "./types.js";

export async function flush(client: DrizzleClientDb) {
	// Drop all tables in the current database
	await client.execute(sql`
		DO $$
		DECLARE
			r RECORD;
		BEGIN
			FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
				EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
			END LOOP;
		END $$;
	`);

	// Drop all sequences
	await client.execute(sql`
		DO $$
		DECLARE
			r RECORD;
		BEGIN
			FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
				EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
			END LOOP;
		END $$;
	`);

	return;
}

// import type { PGlite } from "@electric-sql/pglite";

// export class Letsync {
// 	public IS_SYNCING: boolean;
// 	public IS_CONNECTED: boolean;

// 	private database: PGlite;
// 	private db: any;
// 	private ws: WebSocket | undefined;

// 	private debug: boolean;
// 	private logger = {
// 		// biome-ignore lint/suspicious/noExplicitAny: console.log()
// 		error: (...message: any[]) => {
// 			console.error("[LETSYNC]", ...message);
// 			// TODO: REPORT
// 		},
// 		// biome-ignore lint/suspicious/noExplicitAny: console.log()
// 		log: (...message: any[]) =>
// 			this.debug && console.log("[LETSYNC]", ...message),
// 	};

// 	constructor({
// 		client,
// 		orm,
// 		debug,
// 		// webWorker,
// 	}: {
// 		client: PGlite;
// 		orm: any;
// 		debug?: boolean;
// 		// webWorker?: boolean;
// 	}) {
// 		this.database = client;
// 		this.db = orm(client);
// 		this.ws = undefined;
// 		this.debug = debug ?? false;
// 		this.IS_SYNCING = false;
// 		this.IS_CONNECTED = false;

// 		this.client = new WebSocketClient(client);
// 	}

// 	async connect() {
// 		const connectionId = await this
// 			.#query`SELECT * FROM metadata WHERE id = 'connectionId'`;
// 		const version = await this
// 			.#query`SELECT * FROM metadata WHERE id = 'version'`;
// 		const lastSynced = await this
// 			.#query`SELECT * FROM metadata WHERE id = 'lastSyncedAt'`;

// 		this.logger.log("Connection ID", connectionId);
// 		this.logger.log("Version", version);
// 		this.logger.log("Last synced at", lastSynced);

// 		const wsUrl = `ws://localhost:3000/?o=k&id=${connectionId || "NULL"}`;
// 		this.logger.log("Connecting to WebSocket", wsUrl);

// 		const ws = new WebSocket(wsUrl);
// 		ws.onopen = async () => {
// 			this.IS_CONNECTED = true;
// 			this.logger.log("Connected to WebSocket");
// 		};
// 		ws.onclose = (event) => {
// 			this.IS_CONNECTED = false;
// 			if (event.wasClean) this.logger.log("WebSocket closed cleanly");
// 			else this.logger.error("WebSocket connection died");
// 		};
// 		ws.onerror = (error) => {
// 			this.logger.error("WebSocket error:", error);
// 			this.client.$interceptError(error);
// 		};
// 		ws.onmessage = (event) => {
// 			this.logger.log("Message from server:", event);
// 			this.client.$interceptMessage(event);
// 		};
// 		this.ws = ws;

// 		return {
// 			db: this.db,
// 			useLiveQuery: this.useLiveQuery,
// 		};
// 	}

// 	#query(query: TemplateStringsArray) {
// 		// TODO: REPLACE BY DATABASE TYPE
// 		return this.database
// 			.sql(query)
// 			.then((result) => result.rows[0].value as string)
// 			.catch((err) => {
// 				if (err.toString() === 'error: relation "metadata" does not exist')
// 					return undefined;
// 				throw err;
// 			});
// 	}

// 	useLiveQuery = (query: TemplateStringsArray) => {
// 		return this.database
// 			.sql(query)
// 			.then((result) => result.rows[0].value as string);
// 	};

// 	// !
// 	async checkForUpgrade() {
// 		const version = await this
// 			.#query`SELECT * FROM metadata WHERE id = "version";`;
// 		this.logger.log("DB Version:", version);
// 		const $latest = await fetch("/letsync/version"); // !
// 		const latestVersion = await $latest.json();
// 		this.logger.log("Latest Version:", latestVersion);
// 		const isAvailable = latestVersion > version.value;
// 		return { isAvailable, latestVersion };
// 	}

// 	// !
// 	async getSchema(version: string, migrateFromVersion?: string) {
// 		const latestVersion = await fetch(
// 			`/letsync/version?from=${migrateFromVersion}&to=${version}`,
// 		);
// 		const latestSchema = await latestVersion.json();
// 		return latestSchema;
// 	}

// 	// !
// 	async getLastSynced() {
// 		const metadata = await this.database.query("select lastSyncedAt();");
// 		const { rows } = metadata;
// 		const { lastSynced } = rows[0] as any; // TODO: proper type
// 		return lastSynced;
// 	}

// 	// !
// 	async sync() {
// 		const lastSynced = await this.getLastSynced();
// 		const _latestSchema = await this.getSchema(version, lastSynced);
// 		// TODO: SYNC TABLES
// 	}

// 	// !
// 	async upgrade(version = "latest") {
// 		const metadata = await this.database.query("select version();");
// 		const { rows } = metadata;
// 		const schema = await this.getSchema(version, (rows[0] as any).version); // TODO: proper type
// 		this.logger.log(
// 			"Upgrading DB Version from",
// 			(metadata.rows[0] as any).version, // TODO: proper type
// 			"to",
// 			schema.version,
// 		);

// 		// TODO: CALCULATE CHANGES
// 		// TODO: BACKUP DB
// 		// TODO: APPLY SCHEMA

// 		const ack = this.ws?.send(
// 			JSON.stringify({
// 				data: {},
// 				id: "upgrade",
// 				type: "C->S:upgrade_complete",
// 			}),
// 		);
// 		ack.on(() => {
// 			// TODO: UPDATE DB ON SERVER INTIMATION
// 		});
// 	}

// 	// async subscribe() {
// 	// 	return () => this.unsubscribe();
// 	// }

// 	// async unsubscribe() {}
// }

// const client = {
// 	_listeners: [],
// 	$interceptError: (_error: any) => {
// 		//
// 	},
// 	$interceptMessage: (event: any) => {
// 		const { type, data } = JSON.parse(event.data);
// 		if (type === "S2C:init:ACK") {
// 			//
// 		}
// 		// const { type, data } = JSON.parse(event.data);
// 		if (type === "S2C:init") {
// 			//
// 			const { schema_query } = data;
// 			// TODO: EXECUTE (SCHEMA)
// 			this.db.exec(schema_query);
// 			// TODO: SYNC TABLES
// 		} else if (type === "S2C:get_schema") {
// 			//
// 		} else if (type === "S2C:upgrade") {
// 			//
// 		} else if (type === "S2C:sync") {
// 			//
// 		} else if (type === "S2C:data") {
// 			//
// 		}
// 		//  else if (type === 'C2S:push_data') {
// 		// 	//
// 		// } else if (type === 'C2S:push_operation') {
// 		// 	//
// 		// }
// 		else if (type === "C->S:upgrade_complete:ACK") {
// 			//
// 		}
// 	},
// 	informSchemaUpgradeCompleted: (_params: any) => {
// 		const data = undefined as unknown as any;
// 		return { data, success: true };
// 	},
// 	push: {
// 		data: (_params: any) => {
// 			const data = undefined as unknown as any;
// 			return { data, success: true };
// 		},
// 		operation: (_params: any) => {
// 			const data = undefined as unknown as any;
// 			return { data, success: true };
// 		},
// 	},
// 	sync: {
// 		end: (_params: any) => {
// 			const data = undefined as unknown as any;
// 			return { data, success: true };
// 		},
// 		start: (_params: any) => {
// 			const data = undefined as unknown as any;
// 			return { data, success: true };
// 		},
// 	},
// };
