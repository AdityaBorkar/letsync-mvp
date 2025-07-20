import type { Config } from "../config.js";
import type { ServerPubsub } from "../pubsub/index.js";

export namespace ServerDB {
	export type Adapter<DT> = ServerDB<DT>;

	export type CreateAdapter<DBClient> = (props: {
		pubsub: ServerPubsub.Adapter;
		config: Config;
	}) => ServerDB.Adapter<DBClient>;
}

type ServerDB<DT> = {
	__brand: "LETSYNC_SERVER_DATABASE";
	name: string;
	client: DT;
	waitUntilReady: () => Promise<void>;
} & (
	| {
			type: "SQL";
			query: (query: string) => Promise<unknown>;
	  }
	| {
			type: "NOSQL";
	  }
);
