import type { BunRequest } from 'bun';

import { auth } from '@/lib/auth/config';

export async function getData_SSE(request: BunRequest) {
	const headers = request.headers;
	const session = await auth.api.getSession({ headers });
	const userId = session?.user?.id;
	if (!userId) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}
}
