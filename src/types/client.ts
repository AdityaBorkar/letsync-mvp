// biome-ignore-all lint/style/noNamespace: FOR INTERNAL USE ONLY
import type { Context } from "@/core/client/config.ts"

import type { SQL_Schemas } from "./schemas.ts"

export type GenericObject = { [key: string]: string | boolean | GenericObject }

export namespace ClientDb {
  export type Adapter<T> = {
    __brand: "LETSYNC_CLIENT_DB"
    client: T
    name: string
    connect: () => Promise<void>
    close: () => Promise<void>
    metadata: {
      get: (key: string) => Promise<string | boolean | GenericObject | null>
      set: (
        key: string,
        value: string | boolean | GenericObject
      ) => Promise<void>
      remove: (key: string) => Promise<void>
    }
    flush: () => Promise<true | string>
    schema: {
      introspect: () => Promise<unknown> // TODO: Define the type
      initialize: (schema: SQL_Schemas.Schema) => Promise<void>
      migrate: (props: { idx: string }) => Promise<void>
      list: (props?: {
        aboveVersion: string
        belowVersion?: string | undefined
      }) => Promise<SQL_Schemas.Schema[]>
    }
    size: () => Promise<number>
    export: (options: {
      compression: "none" | "gzip" | "auto"
    }) => Promise<File | Blob>
  }
}

export namespace ClientPubSub {
  export type Adapter = {
    __brand: "LETSYNC_CLIENT_PUBSUB"
    name: string
    connect: (
      context: Omit<Context, "status" | "fetch">
    ) => Promise<void> | void
    disconnect: () => Promise<void> | void
    syncItems: {
      db: string[]
      fs: string[]
    }
  }
}

export namespace ClientFs {
  export type Adapter<T> = {
    __brand: "LETSYNC_CLIENT_FS"
    name: string
    filesystem: T
    init: () => Promise<void>
    close: () => Promise<void>
  }
}
