import type { PGlite } from '@electric-sql/pglite';
import type { PgliteDatabase } from 'drizzle-orm/pglite';

// biome-ignore lint/suspicious/noExplicitAny: WE NEED TO SUPPORT ANY DATABASE TYPE
export type DatabaseType = PgliteDatabase<any>;
export type DatabaseListType = {
	client: PGlite;
	name: string;
}[];

// Database operations
export type OperationType = 'insert' | 'update' | 'delete';

// Base message interface for type safety
export interface BaseMessage {
	type: string;
	timestamp?: number;
}

// Client to Server Messages
export interface SyncRequestMessage extends BaseMessage {
	type: 'sync_request';
	since_timestamp: number;
	table_filters?: string[];
	request_id?: string; // For tracking request/response pairs
}

export interface MutationMessage extends BaseMessage {
	type: 'mutation';
	table: string;
	operation: OperationType;
	data: Record<string, any>;
	client_timestamp: number;
	temp_id?: string; // For optimistic updates
	request_id?: string; // For tracking request/response pairs
}

export interface TimestampRequestMessage extends BaseMessage {
	type: 'timestamp_request';
	request_id?: string;
}

export interface PingMessage extends BaseMessage {
	type: 'ping';
}

// Server to Client Messages
export interface ConnectedMessage extends BaseMessage {
	type: 'connected';
	userId: string;
	timestamp: number;
}

export interface PongMessage extends BaseMessage {
	type: 'pong';
	timestamp: number;
}

export interface SyncDataMessage extends BaseMessage {
	type: 'sync_data';
	changes: ChangeRecord[];
	timestamp: number;
	has_more?: boolean; // Indicates if there are more changes to sync
	request_id?: string;
}

export interface MutationAckMessage extends BaseMessage {
	type: 'mutation_ack';
	temp_id?: string;
	success: boolean;
	error?: SyncError;
	server_timestamp: number;
	record_id?: string; // The actual record ID if mutation succeeded
	request_id?: string;
}

export interface TimestampResponseMessage extends BaseMessage {
	type: 'timestamp_response';
	timestamp: number;
	request_id?: string;
}

export interface SyncStatusMessage extends BaseMessage {
	type: 'sync_status';
	status: 'syncing' | 'synced' | 'error' | 'conflict';
	message?: string;
	details?: any;
}

export interface ErrorMessage extends BaseMessage {
	type: 'error';
	message: string;
	code?: string;
}

export type SyncMethods =
	| 'websocket'
	| 'webtransport'
	| 'http-short-polling'
	| 'sse';

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

// Change tracking types
export interface ChangeRecord {
	id: string;
	tenant_id: string;
	table_name: string;
	record_id: string;
	operation: OperationType;
	change_data: Record<string, any> | null;
	timestamp: number;
	user_id: string;
}

// =============================================================================
// ERROR HANDLING TYPES
// =============================================================================

export interface SyncError {
	code: SyncErrorCode;
	message: string;
	details?: Record<string, any>;
	field?: string; // Specific field that caused the error
}

export enum SyncErrorCode {
	// Validation errors
	VALIDATION_FAILED = 'VALIDATION_FAILED',
	SCHEMA_MISMATCH = 'SCHEMA_MISMATCH',
	REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',
	INVALID_DATA_TYPE = 'INVALID_DATA_TYPE',

	// Authorization errors
	UNAUTHORIZED = 'UNAUTHORIZED',
	TENANT_ACCESS_DENIED = 'TENANT_ACCESS_DENIED',
	INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

	// Conflict errors
	RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
	CONCURRENT_MODIFICATION = 'CONCURRENT_MODIFICATION',
	STALE_DATA = 'STALE_DATA',

	// System errors
	DATABASE_ERROR = 'DATABASE_ERROR',
	INTERNAL_ERROR = 'INTERNAL_ERROR',
	RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
	CONNECTION_ERROR = 'CONNECTION_ERROR',
}

export interface SyncErrorMessage extends BaseMessage {
	type: 'sync_error';
	error: SyncError;
	request_id?: string;
}

// =============================================================================
// MUTATION QUEUE TYPES
// =============================================================================

export interface MutationQueueRecord {
	id: string;
	tenant_id: string;
	user_id: string;
	mutation_data: MutationMessage;
	status: MutationStatus;
	created_at: number;
	processed_at?: number;
	error?: SyncError;
	retry_count: number;
	max_retries: number;
}

export enum MutationStatus {
	PENDING = 'pending',
	PROCESSING = 'processing',
	COMPLETED = 'completed',
	FAILED = 'failed',
	RETRYING = 'retrying',
}

// =============================================================================
// UNION TYPES FOR MESSAGE HANDLING
// =============================================================================

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

// All sync protocol messages (extends base WebSocketMessage)
export type SyncMessage = ClientMessage | ServerMessage;

// =============================================================================
// SYNC ENGINE CONFIGURATION
// =============================================================================

export interface SyncConfig {
	// Timestamp management
	sync_interval_ms: number;
	max_changes_per_sync: number;

	// Conflict resolution
	conflict_resolution_strategy: 'last_write_wins' | 'merge' | 'manual';

	// Performance tuning
	batch_size: number;
	debounce_ms: number;

	// Error handling
	max_retry_attempts: number;
	retry_backoff_ms: number;

	// Rate limiting
	max_mutations_per_minute: number;
	max_sync_requests_per_minute: number;
}

// =============================================================================
// TYPE GUARDS AND VALIDATION
// =============================================================================

export function isClientMessage(message: any): message is ClientMessage {
	return (
		message &&
		typeof message === 'object' &&
		typeof message.type === 'string' &&
		['sync_request', 'mutation', 'timestamp_request', 'ping'].includes(
			message.type,
		)
	);
}

export function isServerMessage(message: any): message is ServerMessage {
	return (
		message &&
		typeof message === 'object' &&
		typeof message.type === 'string' &&
		[
			'sync_data',
			'mutation_ack',
			'timestamp_response',
			'sync_status',
			'sync_error',
			'connected',
			'pong',
			'error',
		].includes(message.type)
	);
}

export function isSyncRequestMessage(
	message: any,
): message is SyncRequestMessage {
	return (
		message?.type === 'sync_request' &&
		typeof message.since_timestamp === 'number'
	);
}

export function isMutationMessage(message: any): message is MutationMessage {
	return (
		message?.type === 'mutation' &&
		typeof message.table === 'string' &&
		['insert', 'update', 'delete'].includes(message.operation) &&
		typeof message.data === 'object' &&
		typeof message.client_timestamp === 'number'
	);
}

export function isTimestampRequestMessage(
	message: any,
): message is TimestampRequestMessage {
	return message?.type === 'timestamp_request';
}

// =============================================================================
// SERIALIZATION UTILITIES
// =============================================================================

export class MessageSerializer {
	static serialize(message: SyncMessage): string {
		try {
			return JSON.stringify(message, MessageSerializer.replacer);
		} catch (error) {
			throw new Error(
				`Failed to serialize message: ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}

	static deserialize(data: string): SyncMessage {
		try {
			const parsed = JSON.parse(data, MessageSerializer.reviver);
			if (!MessageSerializer.isValidMessage(parsed)) {
				throw new Error('Invalid message format');
			}
			return parsed;
		} catch (error) {
			throw new Error(
				`Failed to deserialize message: ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}

	private static replacer(_key: string, value: any): any {
		// Handle special data types that need custom serialization
		if (value instanceof Date) {
			return { __type: 'Date', value: value.toISOString() };
		}
		if (value instanceof RegExp) {
			return { __type: 'RegExp', value: value.toString() };
		}
		return value;
	}

	private static reviver(_key: string, value: any): any {
		// Handle special data types that need custom deserialization
		if (value && typeof value === 'object' && value.__type) {
			switch (value.__type) {
				case 'Date':
					return new Date(value.value);
				case 'RegExp': {
					const match = value.value.match(/\/(.+)\/([gimuy]*)/);
					return match
						? new RegExp(match[1], match[2])
						: new RegExp(value.value);
				}
			}
		}
		return value;
	}

	private static isValidMessage(obj: any): obj is SyncMessage {
		return isClientMessage(obj) || isServerMessage(obj);
	}
}

// =============================================================================
// ERROR UTILITIES
// =============================================================================

export class SyncErrorFactory {
	static validationError(
		message: string,
		field?: string,
		details?: Record<string, any>,
	): SyncError {
		return {
			code: SyncErrorCode.VALIDATION_FAILED,
			details,
			field,
			message,
		};
	}

	static unauthorizedError(message: string = 'Unauthorized access'): SyncError {
		return {
			code: SyncErrorCode.UNAUTHORIZED,
			message,
		};
	}

	static tenantAccessError(tenantId: string): SyncError {
		return {
			code: SyncErrorCode.TENANT_ACCESS_DENIED,
			message: `Access denied to tenant: ${tenantId}`,
		};
	}

	static conflictError(
		message: string,
		details?: Record<string, any>,
	): SyncError {
		return {
			code: SyncErrorCode.CONCURRENT_MODIFICATION,
			details,
			message,
		};
	}

	static databaseError(
		message: string,
		details?: Record<string, any>,
	): SyncError {
		return {
			code: SyncErrorCode.DATABASE_ERROR,
			details,
			message,
		};
	}

	static rateLimitError(message: string = 'Rate limit exceeded'): SyncError {
		return {
			code: SyncErrorCode.RATE_LIMIT_EXCEEDED,
			message,
		};
	}
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function generateRequestId(): string {
	return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getCurrentTimestamp(): number {
	return Date.now();
}

export function isValidTableName(tableName: string): boolean {
	// Basic validation for table names (alphanumeric, underscore, starts with letter)
	return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(tableName);
}

export function sanitizeTableName(tableName: string): string {
	return tableName.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
}

export function createChangeRecord(
	tenantId: string,
	tableName: string,
	recordId: string,
	operation: OperationType,
	data: Record<string, any> | null,
	userId: string,
	timestamp: number = getCurrentTimestamp(),
): ChangeRecord {
	return {
		change_data: data,
		id: `change_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
		operation,
		record_id: recordId,
		table_name: tableName,
		tenant_id: tenantId,
		timestamp,
		user_id: userId,
	};
}
