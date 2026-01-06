export type ApiHandlerAuth<R extends Request> = (
  request: R
) => Promise<
  | { userId: string; deviceId: string }
  | { message: string; status: 401 | 403 | 404 | 500 }
>
