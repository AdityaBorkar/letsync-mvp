import { type } from "arktype"

import type { OrmConfig } from "@/cli/orm/types.js"

import { generate } from "./generate.ts"
import { migrate } from "./migrate.ts"

const configSchema = type({
  dialect: "string",
  out: "string",
  schema: "string"
})

export type Config = typeof configSchema.infer

export const drizzle: OrmConfig = {
  config: {
    fileName: "drizzle.config",
    schema: configSchema
  },
  methods: {
    generate,
    migrate
  }
}
