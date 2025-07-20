import type { endpoints } from "../server/endpoints.js";
import type { HttpMethod } from "./constants.js";

export async function $fetch<
	MethodType extends HttpMethod,
	EndpointType extends keyof typeof endpoints,
	// @ts-expect-error
	SearchParamsType extends ApiRouter[MethodType][EndpointType]["searchParams"], // ! THIS DOES NOT WORk
>(props: {
	method: MethodType;
	baseUrl: string;
	endpoint: EndpointType;
	searchParams?: SearchParamsType;
}) {
	const { method, baseUrl, endpoint, searchParams } = props;
	const url = `${baseUrl}${endpoint}?${new URLSearchParams(searchParams)}`;
	const response = await fetch(url, { method })
		.then((res) => {
			const data = res.json() as Promise<
				// @ts-expect-error
				ReturnType<ApiRouter[MethodType][EndpointType]>
			>;
			// TODO - zod.parse(data)
			return data;
		})
		.catch((error) => {
			console.error({ error });
			throw error;
		});
	return response;
}
