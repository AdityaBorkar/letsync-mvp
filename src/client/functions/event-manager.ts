export type Events = {
  "status:network": (value: boolean) => void
  "status:sync": (value: boolean) => void
  "status:db": (value: boolean) => void
  "status:fs": (value: boolean) => void
  // "network:offline": () => void
  // "network:online": () => void
  // "sync:start": () => void
  // "sync:stop": () => void
  // "db:start": () => void
  // "db:stop": () => void
  // "fs:start": () => void
  // "fs:stop": () => void
  // "auth.grant": (data: { userId: string; deviceId: string }) => void;
  // "auth.refresh": (data: { userId: string; deviceId: string }) => void;
  // "auth.revoke": (data: { userId: string; deviceId: string }) => void;
  // "device:register": () => void;
  // "device:deregister": () => void;
  // "device:connected": () => void;
  // "device:disconnected": () => void;
  // "^pull": () => void;
  // "^push": () => void;
  // "^sync": () => void;
}

export type EventName = keyof Events

export function EventManager() {
  const subscribers = new Map([
    ["status:network", new Set<Events["status:network"]>()],
    ["status:sync", new Set<Events["status:sync"]>()],
    ["status:db", new Set<Events["status:db"]>()],
    ["status:fs", new Set<Events["status:fs"]>()]
  ])

  return {
    emit: <E extends EventName>(event: E, data: Parameters<Events[E]>[0]) => {
      for (const callback of subscribers.get(event) ?? []) {
        callback(data)
      }
    },
    getSubscribers: <E extends EventName>(event: E) => {
      return subscribers.get(event) ?? new Set<Events[E]>()
    },
    subscribe: <E extends EventName>(event: E | E[], callback: Events[E]) => {
      const events = Array.isArray(event) ? event : [event]
      for (const event of events) {
        subscribers.get(event)?.add(callback)
      }
      return () => {
        for (const event of events) {
          subscribers.get(event)?.delete(callback)
        }
      }
    },
    unsubscribe: <E extends EventName>(callback: Events[E]) => {
      for (const [, callbacks] of subscribers.entries()) {
        callbacks.delete(callback)
      }
    }
  }
}
