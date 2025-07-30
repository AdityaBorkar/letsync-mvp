// biome-ignore lint/performance/noBarrelFile: THIS IS A LIBRARY
export { createClient as drizzle_client } from "./client/index.js";
export { transformSchema } from "./client/transform-schema.js";
export { registerServerDb as drizzle_server } from "./server/index.js";
