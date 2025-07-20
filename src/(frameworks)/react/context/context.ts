import { createContext } from "react";

import type { ClientDB, ClientFS, ClientPubsub } from "@/types/index.js";

export type Connected_PubsubAdapter = Awaited<
	ReturnType<ClientPubsub.Adapter["connect"]>
>;

export interface LetsyncContextType {
	db: ClientDB.Adapter<unknown>[];
	fs: ClientFS.Adapter<unknown>[];
	pubsub: ClientPubsub.Adapter;
}

export const LetsyncContext = createContext<LetsyncContextType>({
	db: [] as ClientDB.Adapter<unknown>[],
	fs: [] as ClientFS.Adapter<unknown>[],
	pubsub: null as unknown as ClientPubsub.Adapter,
});
