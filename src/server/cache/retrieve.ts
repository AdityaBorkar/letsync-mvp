import type { EndpointContext } from '../index.js';

export default async function cacheRetrieve(
	request: Request,
	_: EndpointContext,
) {
	const input = await request.json();
	console.log('cacheRetrieve REQUEST RECEIVED WITH BODY: ', request);
	console.log('cacheRetrieve REQUEST RECEIVED WITH BODY: ', input);

	const response = {
		ack: true,
	};
	return response;
}
