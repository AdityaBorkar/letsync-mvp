import { useEffect, useState } from "react"

// @ts-expect-error TODO: Define Types
export type QueryFn = (query: typeof client.query) => Promise<any>
// TODO: Replace `Promise<any>` with `ReturnType<typeof query>` without execute()

// TODO: Complete typescript support for this function
// TODO: Use a common query interface to assume drizzle and every other orm
export function useQuery(query: QueryFn) {
  const { client, isReady } = useDatabase()
  const [isPending, setIsPending] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!isPending || !isReady) return
    // @ts-expect-error temporary
    query(client.query)
      // @ts-expect-error
      .execute()
      // @ts-expect-error temporary
      .then((data) => {
        console.log("QUERY")
        console.log({ data })
        setData(data)
        setIsPending(false)
      })
  }, [isPending, isReady])

  console.log({ data, isPending, isReady, key: query.name })
  return { data, isPending }
}

export function useDatabase() {
  const client = "TODO: USE DATABASE"
  return { client, isReady: true }
  // const [isPending, setIsPending] = useState(false)
  // // useEffect(() => {
  // // 	startTransition(async () => {
  // // 		const db = await initPGlite();
  // // 		dbClient = drizzle(db, { schema });
  // // 		db.waitReady();
  // // 	});
  // // }, []);
  // return { db: client, isPending }
}
