import type { MutationContext, MutationMiddleware } from "./mutation.js";

export type MiddlewareComposer = <T extends MutationContext>(
	...middlewares: Array<MutationMiddleware<any, T>>
) => MutationMiddleware<any, T>;

export const composeMiddleware: MiddlewareComposer = (...middlewares) => {
	return async (data, context) => {
		for (const middleware of middlewares) {
			await middleware(data, context);
		}
	};
};

export const createConditionalMiddleware = <T extends MutationContext>(
	condition: (data: any, context: T) => boolean | Promise<boolean>,
	middleware: MutationMiddleware<any, T>,
): MutationMiddleware<any, T> => {
	return async (data, context) => {
		const shouldRun = await condition(data, context);
		if (shouldRun) {
			await middleware(data, context);
		}
	};
};

export const createEnvironmentMiddleware = <T extends MutationContext>(
	clientMiddleware?: MutationMiddleware<any, T>,
	serverMiddleware?: MutationMiddleware<any, T>,
): MutationMiddleware<any, T> => {
	return async (data, context) => {
		const env =
			context.env || (typeof window !== "undefined" ? "client" : "server");

		if (env === "client" && clientMiddleware) {
			await clientMiddleware(data, context);
		} else if (env === "server" && serverMiddleware) {
			await serverMiddleware(data, context);
		}
	};
};
