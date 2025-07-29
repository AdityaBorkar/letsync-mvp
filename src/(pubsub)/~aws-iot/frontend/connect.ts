import mqtt from "mqtt";

export default async function connect(props: {
	token: string;
	clientId: string;
	endpoint: string;
	authorizer: string;
	prefix: string;
}) {
	return new Promise<mqtt.MqttClient>((resolve, reject) => {
		const connection = mqtt.connect(
			`wss://${props.endpoint}/mqtt?x-amz-customauthorizer-name=${props.authorizer}`,
			{
				clientId: `device_${props.clientId}`,
				manualConnect: true,
				password: props.token,
				protocolVersion: 5,
				username: "",
			},
		);

		connection.on("connect", async () => {
			resolve(connection);
		});

		connection.on("error", async (error) => {
			console.error("Error connecting to MQTT", error);
			reject();
		});

		connection.connect();
	});
}

interface LiveProps {
	endpoints: string[];
}

type ClientParams = unknown;

export function live(props: LiveProps, params: ClientParams) {
	// TODO - MQTT ENDPOINT SUBSCRIPTION
	const { endpoints } = props;
	// const { apiUrl, pubsub } = superProps;
	console.log({ params, props });

	// TODO - POLL FOR ALLOWED TOPICS AND THEN SUBSCRIBE TO ALL

	for (const endpoint of endpoints) {
		console.log({ endpoint });
		// pubsub.subscribe(endpoint, (data) => {
		// 	console.log("CONGRATULATIONS!! RECEIVED DATA:");
		// 	console.log({ data });
		// 	// TODO - WRITE
		// });
	}
}

// TODO - WRITE CODE TO CANCEL SUBSCRIPTIONS
// const live = { subscribe, unsubscribe };
// async function subscribe() {}
// async function unsubscribe() {}

// TODO - PUBSUB ANNOUNCE
// TODO - SET LastActive AS TRIGGER ON PUBSUB CLOSE CONNECTIONS
// pubsub.close(); // if no database / connections are there. outsource to pubsub module
// console.error("Cannot apply incoming changes because DB is closed")
