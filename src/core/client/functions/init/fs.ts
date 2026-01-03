import type { Context } from "@/core/client/config.ts"
import type { ClientFs } from "@/types/client.ts"

export async function initFs(props: {
  context: Context
  fs: ClientFs.Adapter<unknown>
}) {
  const { fs } = props
  await fs.init()
}
