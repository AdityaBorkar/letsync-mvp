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
    version: number
  }
}
