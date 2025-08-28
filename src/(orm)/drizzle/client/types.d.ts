import type { PGlite } from "@electric-sql/pglite"
import type { PgliteDatabase } from "drizzle-orm/pglite"

type pglite<S> = PgliteDatabase<S> & { $client: PGlite }

export type DrizzleClientDb = pglite<Record<string, unknown>>

export type DrizzleClientDb_typed<S extends Record<string, unknown>> = pglite<S>

// TODO: Redefine it to include all supported types
