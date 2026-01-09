import { Logger } from "../../../utils/logger.js"
import { Context } from "./context.js"

export const logger = new Logger(() => {
  const context = Context.getStore()
  const prefix = context?.debug?.prefix ?? "--LETSYNC API SERVER--"
  const color = context?.debug?.color ?? "#fff"
  return { color, prefix }
})
