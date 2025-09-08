export type SyncMethod =
  | "sse"
  | "websocket"
  | "webtransport"
  | "http-long-polling"
  | "http-short-polling"

export interface WebsocketData {
  userId: string
  deviceId: string
  connectionTime: number
}
