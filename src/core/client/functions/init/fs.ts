import type { ClientFs } from "@/types"

import type { Context } from "../../../../core/client/config.js"

export async function initFs(props: {
  context: Context
  fs: ClientFs.Adapter<unknown>
}) {
  const { fs } = props
  await fs.init()
}
