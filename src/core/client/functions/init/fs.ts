import type { Context } from "@/core/client/config/index.js"
import type { ClientFs } from "@/types/client.js"

export async function initFs(props: {
  context: Context
  fs: ClientFs.Adapter<unknown>
}) {
  const { fs } = props
  await fs.init()
}
