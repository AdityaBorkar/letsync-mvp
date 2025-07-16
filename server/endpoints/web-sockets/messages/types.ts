import { type } from 'arktype';

export const DataCacheMessage = type({
	database: [{ cursor: 'string', name: 'string' }, '[]'],
	refId: 'string',
	type: '"sync_data"',
});

export const DataOperationsMessage = type({
	database: [{ cursor: 'string', name: 'string' }, '[]'],
	refId: 'string',
	type: '"sync_data"',
});

export const PongMessage = type({
	refId: 'string',
	timestamp: 'number',
	type: '"pong"',
});
