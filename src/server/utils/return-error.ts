export function ResponseError(error: string) {
	return Response.json({ error }, { status: 400 });
}
