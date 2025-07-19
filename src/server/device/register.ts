import { createId } from '@paralleldrive/cuid2';
import jwt from 'jsonwebtoken';

import type { EndpointContext } from '../../server/index.js';
import getLatestSchema from '../schema/getLatest.js';

export default async function deviceRegister(
	request: Request,
	params: EndpointContext,
) {
	try {
		const { db: databases, pubsub, auth } = params;
		const { userId } = auth;

		const device = { deviceId: createId(), isActive: true, userId };
		const metadata = decodeURI(
			new URL(request.url).searchParams.get('metadata') || '',
		);

		const endpoints: string[] = [
			// TODO - SOLVE THIS
			...(ACL.roles || []).map((role) => `role:${role}`),
			`user:${userId}`,
		];

		const schema = await getLatestSchema();

		const db = databases[0]; // TODO - How to select the correct database?
		if (!db)
			return new Response(JSON.stringify({ error: 'No database found' }), {
				status: 500,
			});

		await db.waitUntilReady();
		if (db.type === 'SQL') {
			await db.query(
				`INSERT INTO devices (deviceId, userId, isActive, schemaVersion) VALUES ('${device.deviceId}', '${device.userId}', TRUE, ${schema.version})`,
			);
		}

		const token = jwt.sign(
			{ deviceId: device.deviceId, userId },
			pubsub.secret,
			{ expiresIn: '24h' },
		);

		const response = {
			device,
			pubsub: { endpoints, token },
			schema,
		};

		return new Response(JSON.stringify(response), { status: 200 });
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
			status: 500,
		});
	}
}
