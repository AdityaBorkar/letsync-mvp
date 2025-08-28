import type { NodePgDatabase } from "drizzle-orm/node-postgres"
import type { Pool } from "pg"

export type DrizzleServerDb = NodePgDatabase<Record<string, unknown>> & {
  $client: Pool
}

// TODO: Redefine it to include all supported types
