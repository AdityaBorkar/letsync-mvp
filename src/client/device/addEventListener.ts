// import type { Client } from "@/types/client.js";

import type { ClientParams } from "../create.js";

type SubscribeProps = {
	eventName: "data_received";
	callback: (data: any) => void;
};

export async function subscribe(props: SubscribeProps, params: ClientParams) {
	const unsubscribe = () => {};
	return unsubscribe;
}
