import type { ApiEndpoints } from "../server/api-endpoints.js";

type Endpoints = typeof ApiEndpoints;

export function FetchClient(apiUrl: {
	path: string;
	domain: string;
	https: boolean;
}) {
	const baseUrl = `http${apiUrl.https && "s"}://${apiUrl.domain}${apiUrl.path}`;

	const $fetch = async <
		HttpMethod extends keyof Endpoints[Endpoint],
		Endpoint extends keyof Endpoints,
		// @ts-expect-error
		SearchParams extends ApiRouter[Endpoint][HttpMethod]["searchParams"], // TODO: Implement This
	>(
		method: HttpMethod,
		endpoint: Endpoint,
		props: {
			searchParams?: SearchParams;
			body?: Record<string, unknown>;
		},
	) => {
		const { searchParams = {}, body = {} } = props;
		const url = `${baseUrl}${endpoint}?${new URLSearchParams(searchParams)}`;
		const response = await fetch(url, {
			// @ts-expect-error
			method,
			body: body ? JSON.stringify(body) : undefined,
		}).catch((error) => {
			console.error({ error });
			throw error;
		});
		const data = (await response.json()) as Awaited<
			// @ts-expect-error
			ReturnType<Endpoints[Endpoint][HttpMethod]>
		>;
		console.log("Data", response.status, data);
		return data;
	};

	return $fetch;
}
