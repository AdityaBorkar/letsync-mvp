// import type { IncomingMessage, Server } from 'node:http';

// import type { WebSocket } from 'ws';
// import { WebSocketServer } from 'ws';

// import type { Database } from '../../types.js';
// import { createNewConnection } from './create-connection.js';

// interface LetsyncServerProps {
// 	server: Server;
// 	auth: (request: IncomingMessage) => { id: string } | null;
// 	db: Database;
// }

// interface LetsyncWebSocket extends WebSocket {
// 	user: { id: string };
// 	connection: { id: string; lastSyncedAt: Date };
// 	isNewConnection: boolean;
// }

// export function LetsyncWsServer({ server, auth, db }: LetsyncServerProps) {
// 	const wss = new WebSocketServer({ noServer: true });

// 	server.on('upgrade', async (request, socket, head) => {
// 		const user = auth(request);
// 		if (!user) {
// 			socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
// 			socket.destroy();
// 			return;
// 		}

// 		const searchParams = new URLSearchParams(request.url);
// 		const clientId = searchParams.get('clientId') || null;

// 		const isNewConnection = !clientId || clientId === 'NULL';
// 		const connection = isNewConnection
// 			? await createNewConnection(db, user)
// 			: await db.sql`SELECT * FROM connection WHERE id = ${clientId} AND user_id = ${user.id}`.execute();

// 		if (!connection) {
// 			socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
// 			socket.destroy();
// 			return;
// 		}

// 		const lastSyncedAt = new Date();
// 		await db.sql`UPDATE connection SET last_synced_at = ${lastSyncedAt} WHERE id = ${connection.id}`
// 			.execute()
// 			.then(() => {
// 				if (connection) connection.lastSyncedAt = lastSyncedAt;
// 			});
// 		console.log('Connection Authorized');

// 		wss.handleUpgrade(request, socket, head, (client) => {
// 			const ws = client as LetsyncWebSocket;
// 			ws.user = user;
// 			ws.connection = connection;
// 			ws.isNewConnection = isNewConnection;
// 			wss.emit('connection', ws, request);
// 		});
// 	});

// 	wss.on('connection', (ws: LetsyncWebSocket) => {
// 		// TODO: UPDATE LIST OF COMMANDS AND RPC

// 		if (ws.isNewConnection) {
// 			const schema_query = '';
// 			const snapshots: any[] = [];
// 			const pointer = '';
// 			const payload = {
// 				data: { pointer, schema_query, snapshots },
// 				type: 'C2S:init',
// 			};
// 			ws.send(JSON.stringify(payload));
// 		}

// 		ws.on('message', (message) => {
// 			const { type, data } = JSON.parse(message.toString());
// 			if (type === 'C2S:upgrade_complete') {
// 				console.log(data);
// 				// const { schema_query, snapshots, pointer } = data;
// 				const payload = { data: {}, type: 'S2C:init' };
// 				ws.send(JSON.stringify(payload));
// 			} else if (type === 'C2S:push_data') {
// 				const payload = { data: {}, type: 'S2C:get_schema' };
// 				ws.send(JSON.stringify(payload));
// 			} else if (type === 'C2S:push_operation') {
// 				const payload = { data: {}, type: 'S2C:get_schema' };
// 				ws.send(JSON.stringify(payload));
// 			}

// 			console.log(`Received message => ${message}`);
// 			// Echo message back to client
// 			ws.send(`You sent: ${message}`);
// 		});

// 		ws.on('close', () => {
// 			console.log('Client disconnected');
// 		});
// 	});

// 	return { wss };
// }
