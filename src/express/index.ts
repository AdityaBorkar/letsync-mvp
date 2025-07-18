import type { IncomingMessage, Server } from "node:http";

import * as schema from "drizzle/schema";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import type { WebSocket } from "ws";
import { WebSocketServer } from "ws";
import db from "../lib/server-db.js";
import { createNewConnection } from "./createNewConnection.js";

interface LetsyncServerProps {
	server: Server;
	auth: (request: IncomingMessage) => { id: string } | null;
}

interface LetsyncWebSocket extends WebSocket {
	user: { id: string };
	connection: typeof schema.connection.$inferSelect;
	isNewConnection: boolean;
}

export function LetsyncWsServer({ server, auth }: LetsyncServerProps) {
	const wss = new WebSocketServer({ noServer: true });

	server.on("upgrade", async (request, socket, head) => {
		const user = auth(request);
		if (!user) {
			socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
			socket.destroy();
			return;
		}

		const searchParams = new URLSearchParams(request.url);
		const clientId = searchParams.get("clientId") || null;

		const isNewConnection = !clientId || clientId === "NULL";
		const connection = isNewConnection
			? await createNewConnection(user)
			: await db.query.connection.findFirst({
					// TODO: REPLACE DB
					where: ({ id }, { eq }) => eq(id, clientId), // TODO: Check if user
				});

		if (!connection) {
			socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
			socket.destroy();
			return;
		}

		const lastSyncedAt = new Date();
		await db // TODO: REPLACE DB
			.update(schema.connection)
			.set({ lastSyncedAt })
			.where(eq(schema.connection.id, connection.id))
			.then(() => {
				if (connection) connection.lastSyncedAt = lastSyncedAt;
			});
		console.log("Connection Authorized");

		wss.handleUpgrade(request, socket, head, (client) => {
			const ws = client as LetsyncWebSocket;
			ws.user = user;
			ws.connection = connection;
			ws.isNewConnection = isNewConnection;
			wss.emit("connection", ws, request);
		});
	});

	wss.on("connection", (ws: LetsyncWebSocket) => {
		// TODO: UPDATE LIST OF COMMANDS AND RPC

		if (ws.isNewConnection) {
			const schema_query = "";
			const snapshots = [];
			const pointer = "";
			const payload = {
				data: { pointer, schema_query, snapshots },
				type: "C2S:init",
			};
			ws.send(JSON.stringify(payload));
		}

		ws.on("message", (message) => {
			const { type, data } = JSON.parse(message.toString());
			if (type === "C2S:upgrade_complete") {
				const { schema_query, snapshots, pointer } = data;
				const payload = { data: {}, type: "S2C:init" };
				ws.send(JSON.stringify(payload));
			} else if (type === "C2S:push_data") {
				const payload = { data: {}, type: "S2C:get_schema" };
				ws.send(JSON.stringify(payload));
			} else if (type === "C2S:push_operation") {
				const payload = { data: {}, type: "S2C:get_schema" };
				ws.send(JSON.stringify(payload));
			}

			console.log(`Received message => ${message}`);
			// Echo message back to client
			ws.send(`You sent: ${message}`);
		});

		ws.on("close", () => {
			console.log("Client disconnected");
		});
	});

	return { wss };
}

export function LetsyncApiHandler(req: Request, res: Response) {
	console.log({ req });
	return res.send("Hello from API");
}
