// =============================================================================
// UNION TYPES FOR MESSAGE HANDLING
// =============================================================================

// All sync protocol messages (extends base WebSocketMessage)
export type SyncMessage = ClientMessage | ServerMessage;

// All possible client-to-server messages
export type ClientMessage =
	| SyncRequestMessage
	| MutationMessage
	| TimestampRequestMessage
	| PingMessage;

// All possible server-to-client messages
export type ServerMessage =
	| SyncDataMessage
	| MutationAckMessage
	| TimestampResponseMessage
	| SyncStatusMessage
	| SyncErrorMessage
	| ConnectedMessage
	| PongMessage
	| ErrorMessage;

// Base message interface for type safety
export interface BaseMessage {
	type: string;
	timestamp?: number;
}

// Client to Server Messages
export interface SyncRequestMessage extends BaseMessage {
	type: "sync_request";
	since_timestamp: number;
	table_filters?: string[];
	request_id?: string; // For tracking request/response pairs
}

export interface MutationMessage extends BaseMessage {
	type: "mutation";
	table: string;
	operation: OperationType;
	data: Record<string, any>;
	client_timestamp: number;
	temp_id?: string; // For optimistic updates
	request_id?: string; // For tracking request/response pairs
}

export interface TimestampRequestMessage extends BaseMessage {
	type: "timestamp_request";
	request_id?: string;
}

export interface PingMessage extends BaseMessage {
	type: "ping";
}

// Server to Client Messages
export interface ConnectedMessage extends BaseMessage {
	type: "connected";
	userId: string;
	timestamp: number;
}

export interface PongMessage extends BaseMessage {
	type: "pong";
	timestamp: number;
}

export interface SyncDataMessage extends BaseMessage {
	type: "sync_data";
	changes: ChangeRecord[];
	timestamp: number;
	has_more?: boolean; // Indicates if there are more changes to sync
	request_id?: string;
}

export interface MutationAckMessage extends BaseMessage {
	type: "mutation_ack";
	temp_id?: string;
	success: boolean;
	error?: SyncError;
	server_timestamp: number;
	record_id?: string; // The actual record ID if mutation succeeded
	request_id?: string;
}

export interface TimestampResponseMessage extends BaseMessage {
	type: "timestamp_response";
	timestamp: number;
	request_id?: string;
}

export interface SyncStatusMessage extends BaseMessage {
	type: "sync_status";
	status: "syncing" | "synced" | "error" | "conflict";
	message?: string;
	details?: any;
}

export interface ErrorMessage extends BaseMessage {
	type: "error";
	message: string;
	code?: string;
}

export type SyncMethods =
	| "websocket"
	| "webtransport"
	| "http-short-polling"
	| "sse";

// Union type for all possible WebSocket messages
export type WebSocketMessageTypes =
	| SyncRequestMessage
	| MutationMessage
	| TimestampRequestMessage
	| PingMessage
	| ConnectedMessage
	| PongMessage
	| SyncDataMessage
	| MutationAckMessage
	| TimestampResponseMessage
	| SyncStatusMessage
	| ErrorMessage
	| SyncErrorMessage;
