// biome-ignore-all lint/style/noNamespace: FOR INTERNAL USE ONLY
export namespace SQL_Schemas {
  export type Metadata = {
    key: string
    type: "string" | "boolean" | "object"
    value: string
  }

  export type Schema = {
    created_at: string
    idx: string
    sql_init: string
    sql_migration: string
    tag: string
  }

  export type Mutation = {
    created_at: string
    mutation_name: string
    request_id: string
    status: string
  }

  export type CdcRecord = {
    action: string
    id: string
    // tenant_id: string
    timestamp: string
    transformations: string
    user_id: string
  }

  export type CdcCache = {
    created_at: string
    cursor_end: string
    cursor_start: string
    id: string
    updated_at: string
    url: string
  }
}
