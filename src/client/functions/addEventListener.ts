// import type { Client } from "@/types/client.js";

import type { ClientParams } from "./create.js";

type SubscribeProps = {
	eventName: string;
	callback: (data: any) => void;
};

export async function subscribe(props: SubscribeProps, params: ClientParams) {
	// ...
	console.log({ params, props });

	const unsubscribe = () => {};

	return unsubscribe;
}
