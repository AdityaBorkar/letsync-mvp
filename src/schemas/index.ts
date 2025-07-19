import { file } from 'bun';

export const SUPPORTED_SCHEMAS = ['drizzle-postgres'];

export async function getSchema(schema: (typeof SUPPORTED_SCHEMAS)[number]) {
	if (!SUPPORTED_SCHEMAS.includes(schema)) {
		throw new Error(`Schema ${schema} is not supported`);
	}
	const text = await file(`./${schema}`).text();
	return text;
}
