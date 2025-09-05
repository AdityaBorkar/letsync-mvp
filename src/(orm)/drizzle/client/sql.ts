// import { sql as drizzleSql } from "drizzle-orm"

// import type { DrizzleClientDb } from "./types.js"

// export function sql<T>(
//   db: DrizzleClientDb,
//   template: TemplateStringsArray | string,
//   ...args: unknown[]
// ) {
//   if (args.length === 0) {
//     return db.execute(template as string) as unknown
//   }
//   return db.execute(drizzleSql<T>(template as TemplateStringsArray, ...args))
// }

// export async function executeSQL(db: DrizzleClientDb, sql: string) {
//   return await db.$client.query(sql)
// }
