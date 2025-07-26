export const context = new Map<string, { timestamp: number }>();

export function generateRefId() {
	// TODO: Prevent Collission
	const refId = crypto.randomUUID();
	const timestamp = Date.now();
	context.set(refId, { timestamp });
	return refId;
}
