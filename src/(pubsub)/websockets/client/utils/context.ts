import { context } from "./generate-ref-id.js"

export function getContextByRefId(refId: string) {
  return context.get(refId)
}
