// import { type } from "arktype"

// import { MessageType } from "../../utils/schema.js"
// import type { WsContext } from "../methods/connect.js"

// type MsgData = typeof msgData.infer
// const msgData = type({
//   created_at: "string",
//   cursor_end: "string",
//   cursor_start: "string",
//   id: "string",
//   updated_at: "string",
//   url: "string"
// })

// function handler(msg: MsgData, context: WsContext) {
//   console.log({ msg })

//   const database = context.db.get("postgres")
//   if (!database) {
//     throw new Error("Database not found")
//   }
//   // @ts-expect-error
//   const db = database.client.$client as any

//   if (msg.url) {
//     const cache = fetch(msg.url) // TODO: Use a TOKEN
//     // TODO: Use a decoder to unpackage
//     console.log({ cache })
//   }

//   db.query(
//     `INSERT INTO "letsync"."cdc_cache"
//       ("created_at", "cursor_end", "cursor_start", "id", "updated_at", "url")
//     VALUES ($1, $2, $3, $4, $5, $6)`,
//     [
//       msg.created_at,
//       msg.cursor_end,
//       msg.cursor_start,
//       msg.id,
//       msg.updated_at,
//       msg.url
//     ]
//   )
// }

// export const cdcCache = {
//   handler,
//   message: MessageType("'cdc-cache'", msgData)
// }
