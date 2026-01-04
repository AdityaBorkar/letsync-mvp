import { type } from "arktype"

export const OrmType = type("'drizzle' | 'prisma'")

export const OrmDialectType = type("'postgres' | 'cockroach'")

export const OrmConfigSchema = type({
  output: {
    client: type({
      dialect: OrmDialectType,
      dir: "string",
      orm: OrmType
    }),
    server: type({
      dialect: OrmDialectType,
      dir: "string",
      orm: OrmType
    })
  },
  schema: {
    encryption: "boolean",
    fields: "'sync-all'",
    tables: "'sync-all'"
  },
  source: {
    dialect: OrmDialectType,
    orm: OrmType,
    schema: "string"
  }
})

export type OrmConfig = typeof OrmConfigSchema.infer

// ----

export type Options = {
  dryRun: boolean
}
