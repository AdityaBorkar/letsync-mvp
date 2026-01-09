import { cdc_get } from "./cdc.js"
import { live_get } from "./live.js"
// import { mutation_get } from "./mutation.js"
import { ping_get } from "./ping.js"

export const handlers = {
  cdc: cdc_get,
  live: live_get,
  // mutation: mutation_get,
  ping: ping_get
}
