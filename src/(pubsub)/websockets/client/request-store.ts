type Callback = ({ type, data }: { type: string; data: unknown }) => void
type Status = "pending" | "resolved"

export function RequestStore() {
  const store = new Map<string, { callback: Callback; status: Status }>()
  return {
    add({ refId, callback }: { refId: string; callback: Callback }) {
      const existing = store.get(refId)
      if (existing) {
        throw new Error(`Request already exists: ${refId}`)
      }
      store.set(refId, { callback, status: "pending" })
    },
    get(refId: string) {
      return store.get(refId)
    },
    markAsResolved(refId: string) {
      const request = store.get(refId)
      if (!request) {
        throw new Error("Request not found")
      }
      request.status = "resolved"
    }
  }
}
