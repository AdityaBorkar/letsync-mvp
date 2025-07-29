import type { ApiEndpoints } from "../server/api-endpoints.js";

type ApiPaths = keyof typeof ApiEndpoints;
type ApiMethods<T extends ApiPaths> = keyof (typeof ApiEndpoints)[T];

export function FetchClient(apiUrl: {
	path: string;
	domain: string;
	https: boolean;
}) {
	const baseUrl = `http${apiUrl.https ? "s" : ""}://${apiUrl.domain}${apiUrl.path}`;

	const $fetch = async <
		TPath extends ApiPaths,
		TMethod extends ApiMethods<TPath>,
	>(
		method: TMethod,
		endpoint: TPath,
		props?: {
			// TODO: Write Type Definitions
			searchParams?: Record<string, string | number | boolean>;
			body?: Record<string, unknown>;
			// TODO: Do not allow Body on GET & HEAD requests
		},
	) => {
		try {
			const url = new URL(`${baseUrl}${endpoint}`);
			for (const [key, value] of Object.entries(props?.searchParams ?? {})) {
				url.searchParams.set(key, String(value));
			}

			const hasBody = props?.body && Object.keys(props.body).length > 0;
			const response = await fetch(url, {
				method: method as string,
				...(hasBody && {
					// headers: { "Content-Type": "application/json" },
					body: JSON.stringify(props.body),
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = (await response.json()) as unknown;
			return { data, error: undefined };
		} catch (err) {
			console.error(err);
			const error = err as Error;
			return { data: undefined, error };
		}
	};

	return $fetch;
}
