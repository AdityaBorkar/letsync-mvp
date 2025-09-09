import { Logger } from "../../../utils/logger.js"

export type Callback = ({
  type,
  data,
  requestId
}: {
  type: "-- END --" | "-- STREAM --"
  data: unknown
  requestId: string
}) => void

type Status = "pending" | "resolved"

export function RequestStore() {
  const store = new Map<string, { callback: Callback; status: Status }>()
  const logger = new Logger("WS:REQUEST-STORE")
  return {
    add({ callback }: { callback: Callback }) {
      const requestId = crypto.randomUUID()
      const existing = store.get(requestId)
      if (existing) {
        logger.error("Request already exists", requestId)
        throw new Error(`Request already exists: ${requestId}`)
      }
      store.set(requestId, { callback, status: "pending" })
      return requestId
    },
    get(requestId: string) {
      return store.get(requestId)
    },
    markAsResolved(requestId: string) {
      const request = store.get(requestId)
      if (!request) {
        logger.error("Request not found", requestId)
        throw new Error("Request not found")
      }
      request.status = "resolved"
    }
  }
}
