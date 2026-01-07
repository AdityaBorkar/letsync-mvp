export type ApiHandlerAuth = (
  request: Request
) => Promise<
  | { userId: string; deviceId: string }
  | { message: string; status: 401 | 403 | 404 | 500 }
>
