import type { WsHandler } from "@/(adapters)/websockets/ws-server/index.js"

export const live_get: WsHandler<"live"> = (payload, _emit, ctx) => {
  const TOPICS = ctx.ws.data.topics
  const subscribedTopics = ctx.ws.subscriptions
  for (const topic of subscribedTopics) {
    ctx.ws.unsubscribe(topic)
  }
  for (const topic of TOPICS) {
    ctx.ws.subscribe(topic)
  }

  const system_callback = (message: string) => {
    if (payload.name !== "") return
    if (payload.cursor < "") return

    //   TODO: Use the CDC Record Payload
    //   emit.stream(payload)
    console.log({ message })
    // emit.stream(message)
  }

  ctx.ws.data.system_callbacks.push(system_callback)

  // TODO: Make a way to end the request from the client side
}

// export const live_end = () => {}
