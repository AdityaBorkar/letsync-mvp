import { Logger } from "../../../utils/logger.js"

export type Callback = ({
  type,
  payload,
  requestId
}: {
  type: string
  payload: unknown
  requestId: string
}) => void

type Status = "pending" | "resolved"

const logger = new Logger("WS:REQUEST-STORE")

export function RequestStore() {
  const store = new Map<string, { callbacks: Callback[]; status: Status }>()

  return {
    create() {
      const id = crypto.randomUUID()
      store.set(id, { callbacks: [], status: "pending" })
      return id
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
    },
    update(requestId: string, callback: Callback) {
      const existing = store.get(requestId)
      if (!existing) {
        logger.error("Request not found", requestId)
        throw new Error("Request not found")
      }
      const callbacks = [...existing.callbacks, callback]
      store.set(requestId, { ...existing, callbacks })
    }
  }
}
