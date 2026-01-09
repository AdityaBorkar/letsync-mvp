import type { Context } from "../config.js"

export async function schemaVerify(request: Request, context: Context) {
  const body = await request.json()
  const { schema, version } = body

  console.log("/schema/verify endpoint is WIP")
  console.log({ schema, version })
  console.log(context)

  // TODO: Write Logic

  return Response.json({ errors: [], integrity: true })
}
