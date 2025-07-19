export const HTTP_METHODS = ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];
