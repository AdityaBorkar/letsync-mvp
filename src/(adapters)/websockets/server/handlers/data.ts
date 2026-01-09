import { RequestStore } from "../../library-ws-rpc/request-store.js"
import type { HttpServer } from "../index.js"
import { Context } from "../utils/context.js"

export async function dataHandler(props: {
  request: Request
  server: HttpServer
}) {
  const context = Context.getStore()
  if (!context) {
    console.error("Context not found")
    return Response.json({ message: "Internal Server Error" }, { status: 500 })
  }

  const { request, server } = props
  const result = await context.auth(request)
  if ("status" in result) {
    const { message, status } = result
    return Response.json({ message }, { status })
  }
  const topics = [
    // TODO: DO NOT HARDCODE
    "poc_replication.public.transactions",
    "poc_replication.public.accounts"
  ]
  const data = {
    connectionTime: Date.now(),
    reqManager: RequestStore(),
    system_callbacks: [],
    topics,
    ...result
  }
  const upgraded = server.upgrade(request, { data })
  if (!upgraded) {
    Response.json({ error: "Failed to upgrade to WebSocket" }, { status: 400 })
  }
  return
}
