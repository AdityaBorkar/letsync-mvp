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
        throw new Error("Request not found", { cause: { requestId } })
      }
      request.status = "resolved"
    },
    update(requestId: string, callback: Callback) {
      const existing = store.get(requestId)
      if (!existing) {
        throw new Error("Request not found", { cause: { requestId } })
      }
      const callbacks = [...existing.callbacks, callback]
      store.set(requestId, { ...existing, callbacks })
    }
  }
}
