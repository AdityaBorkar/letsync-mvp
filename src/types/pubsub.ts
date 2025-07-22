export namespace ClientPubSub {
	export type Adapter<T> = {
		__brand: "LETSYNC_PUBSUB";
		name: string;
		pubsub: T;
	};
	export type SyncMethod =
		| "websocket"
		| "webtransport"
		| "http-short-polling"
		| "sse";
}

export namespace ServerPubSub {
	export type Adapter<T> = {
		__brand: "LETSYNC_PUBSUB_BACKEND";
		name: string;
		pubsub: T;
		// secret: string;
		// publish: PublishFn;
		// subscribe: SubscribeFn;
		// authFn: (token: string) => Promise<{
		// 	subscribe: string[];
		// 	publish: string[];
		// }>;
	};

	export type Token = {
		value: string;
		expiresAt: number;
	};
}

// type SubscribeFn = (
// 	topic: string,
// 	callback: (data: unknown) => void,
// ) => Promise<void>;

// type PublishFn = (
// 	topic: string,
// 	payload: {
// 		[key: string]: unknown;
// 	},
// ) => Promise<void>;

export namespace Client {
	export type EventName = (typeof events)[number];
	export type EventCallbackFn = (data: any) => void;
}

const events = [
	"auth.grant",
	"auth.refresh",
	"auth.revoke",
	"device.register",
	"device.deregister",
	"device:connected",
	"device:disconnected",
	"^pull", // TODO: regex
	"^push", // TODO: regex
	"^sync", // TODO: regex
] as const;
