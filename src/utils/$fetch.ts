import type { ApiEndpoints } from "../server/api-endpoints.js";

type Endpoints = typeof ApiEndpoints;

export async function $fetch<
	HttpMethod extends keyof Endpoints[Endpoint],
	Endpoint extends keyof Endpoints,
	// @ts-expect-error
	SearchParams extends ApiRouter[Endpoint][HttpMethod]["searchParams"], // TODO: Implement This
>(props: {
	method: HttpMethod;
	baseUrl: string;
	endpoint: Endpoint;
	searchParams?: SearchParams;
}) {
	const { method, baseUrl, endpoint, searchParams } = props;
	const url = `${baseUrl}${endpoint}?${new URLSearchParams(searchParams)}`;
	// @ts-expect-error TODO: Fix this
	const response = await fetch(url, { method })
		.then(async (res) => {
			const data = (await res.json()) as Awaited<
				// @ts-expect-error
				ReturnType<Endpoints[Endpoint][HttpMethod]>
			>; // TODO: Implement This
			console.log("Data", res.status, data);
			return data;
		})
		.catch((error) => {
			console.error({ error });
			throw error;
		});
	return response;
}
