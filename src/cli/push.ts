import { drizzlePush } from "./orm/drizzle/push.js"
import { detectOrm } from "./utils/detect-orm.js"

interface PushOptions {
  // schema: SupportedSchemas;
  // output: string;
  dryRun?: boolean
}

export async function push(options: PushOptions) {
  const { dryRun = false } = options

  console.log("Detecting ORM...")
  const orm = await detectOrm()
  if (!orm) {
    throw new Error("No ORM detected")
  }
  console.log(`   Detected ORM: ${orm.name} (${orm.path})`)

  if (orm.name === "drizzle") {
    await drizzlePush(orm.config, { dryRun })
  } else {
    throw new Error(
      "Failed to integrate with ORM. Kindly raise an GitHub issue."
    )
  }
}
