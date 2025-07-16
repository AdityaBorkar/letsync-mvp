import { type } from 'arktype';

// data_ops, name, refId, type: 'data_operations'
const message = type({
	data_ops: type(
		{
			createdAt: 'string',
			id: 'number',
			operation: 'string',
			tenantId: 'number',
			updatedAt: 'string',
		},
		'[]',
	),
	name: 'string',
	refId: 'string',
	type: '"data_operations"',
});

function handler(_ws: WebSocket, msg: typeof message.infer) {
	const { data_ops, name, refId } = msg;

	const data_ops_map = new Map<number, (typeof data_ops)[number]>();

	for (const data_op of data_ops) {
		data_ops_map.set(data_op.id, data_op);
	}
}

export const dataOperations = { handler, message };
