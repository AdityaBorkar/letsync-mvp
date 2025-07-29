// import mqtt from "mqtt";

// export default async function connect(props: {
// 	token: string;
// 	clientId: string;
// 	endpoint: string;
// 	authorizer: string;
// 	prefix: string;
// }) {
// 	return new Promise<mqtt.MqttClient>((resolve, reject) => {
// 		const connection = mqtt.connect(
// 			`wss://${props.endpoint}/mqtt?x-amz-customauthorizer-name=${props.authorizer}`,
// 			{
// 				clientId: `device_${props.clientId}`,
// 				manualConnect: true,
// 				password: props.token,
// 				protocolVersion: 5,
// 				username: "",
// 			},
// 		);

// 		connection.on("connect", async () => {
// 			resolve(connection);
// 		});

// 		connection.on("error", async (error) => {
// 			console.error("Error connecting to MQTT", error);
// 			reject();
// 		});

// 		connection.connect();
// 	});
// }
