// biome-ignore-all lint/style/noNamespace: FOR INTERNAL USE ONLY
import type { SQL_Schemas } from "./schemas.js"

export namespace ServerDb {
  export type Adapter<T> = {
    __brand: "LETSYNC_SERVER_DB"
    name: string
    client: T
    close: () => Promise<void>
    connect: () => Promise<void>
    schema: {
      list: (params?: {
        aboveVersion: string
        belowVersion?: string
      }) => Promise<SQL_Schemas.Schema[]>
    }
    syncInitialize: (strategy: "wal") => Promise<Record<string, unknown>>
  }
}

export namespace ServerFs {
  export type Adapter<T> = {
    __brand: "LETSYNC_SERVER_FS"
    name: string
    filesystem: T
  }
}

export namespace ServerPubSub {
  export type Adapter = {
    __brand: "LETSYNC_SERVER_PUBSUB"
    name: string
    // pubsub: T;
    // syncData: (context: any) => Promise<void>;
    // secret: string;
    // publish: PublishFn;
    // subscribe: SubscribeFn;
    // authFn: (token: string) => Promise<{
    // 	subscribe: string[];
    // 	publish: string[];
    // }>;
  }

  export type Token = {
    value: string
    expiresAt: number
  }
}
