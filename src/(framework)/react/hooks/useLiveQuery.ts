import type { QueryFn } from "./useQuery.js"

export function useLiveQuery(query: QueryFn) {
  console.log(query)
  throw new Error("Not implemented")
}
