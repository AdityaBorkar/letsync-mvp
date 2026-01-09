import type { API_ENDPOINTS } from "../core/server/api-endpoints.js"

type ApiPaths = keyof typeof API_ENDPOINTS
type ApiMethods<T extends ApiPaths> = keyof (typeof API_ENDPOINTS)[T]

export function FetchClient(apiUrl: string) {
  const $fetch = async <Path extends ApiPaths, Method extends ApiMethods<Path>>(
    method: Method,
    endpoint: Path,
    props?: {
      // TODO: Write Type Definitions
      searchParams?: Record<string, string | number | boolean>
      body?: Record<string, unknown>
      // TODO: Do not allow Body on GET & HEAD requests
    }
  ) => {
    try {
      const url = new URL(`${apiUrl}${endpoint}`)
      for (const [key, value] of Object.entries(props?.searchParams ?? {})) {
        url.searchParams.set(key, String(value))
      }

      const hasBody = props?.body && Object.keys(props.body).length > 0
      const response = await fetch(url, {
        method: method as string,
        ...(hasBody && {
          // headers: { "Content-Type": "application/json" },
          body: JSON.stringify(props.body)
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = (await response.json()) as unknown
      return { data, error: undefined }
    } catch (err) {
      console.error(err)
      const error = err as Error
      return { data: undefined, error }
    }
  }

  return $fetch
}
