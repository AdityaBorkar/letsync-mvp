export type ApiHandlerAuth<R extends Request> = (
  request: R
) =>
  | { userId: string; deviceId: string }
  | { message: string; status: 401 | 403 | 404 | 500 }
