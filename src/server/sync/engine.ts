import type { ServerWebSocket } from "bun";

import type { WebSocketData } from "../ws-handler.js";
import { changeTracker } from "./changeTracker.js";
import { conflictResolver } from "./conflictResolver.js";
import { mutationValidator } from "./mutationValidator.js";
import { tenantIsolation } from "./tenantIsolation.js";

export interface SyncRequestMessage {
	type: "sync_request";
	since_timestamp: number;
	table_filters?: string[];
}

export interface MutationMessage {
	type: "mutation";
	table: string;
	operation: "insert" | "update" | "delete";
	data: Record<string, any>;
	client_timestamp: number;
	temp_id?: string;
}

export interface SyncDataMessage {
	type: "sync_data";
	changes: ChangeRecord[];
	timestamp: number;
}

export interface MutationAckMessage {
	type: "mutation_ack";
	temp_id?: string;
	success: boolean;
	error?: string;
	server_timestamp: number;
}

export interface ChangeRecord {
	id: string;
	table_name: string;
	record_id: string;
	operation: "insert" | "update" | "delete";
	change_data: Record<string, any>;
	timestamp: number;
	user_id: string;
}

export interface SyncEngineOptions {
	maxChangesPerMessage?: number;
	validateMutations?: boolean;
	enableConflictResolution?: boolean;
}

/**
 * Main sync engine coordinator that orchestrates sync operations
 * Handles incoming sync requests and mutations from WebSocket clients
 */
export class SyncEngine {
	private options: Required<SyncEngineOptions>;

	constructor(options: SyncEngineOptions = {}) {
		this.options = {
			enableConflictResolution: true,
			maxChangesPerMessage: 100,
			validateMutations: true,
			...options,
		};
	}

	/**
	 * Handle sync request from client
	 * Retrieves changes since the specified timestamp for the user's tenant
	 */
	async handleSyncRequest(
		ws: ServerWebSocket<WebSocketData>,
		message: SyncRequestMessage,
	): Promise<void> {
		try {
			const { userId } = ws.data;
			if (!userId) {
				throw new Error("User not authenticated");
			}

			// Get tenant ID for the user
			const tenantId = await tenantIsolation.getTenantIdForUser(userId);
			if (!tenantId) {
				throw new Error("User tenant not found");
			}

			// Get changes since timestamp with tenant isolation
			const changes = await changeTracker.getChangesSince(
				tenantId,
				message.since_timestamp,
				{
					maxChanges: this.options.maxChangesPerMessage,
					tableFilters: message.table_filters,
				},
			);

			// Send sync data response
			const response: SyncDataMessage = {
				changes,
				timestamp: Date.now(),
				type: "sync_data",
			};

			ws.send(JSON.stringify(response));
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			console.error("Sync request error:", errorMessage);

			const errorResponse = {
				error: errorMessage,
				timestamp: Date.now(),
				type: "sync_error",
			};

			ws.send(JSON.stringify(errorResponse));
		}
	}

	/**
	 * Handle mutation from client
	 * Validates, processes, and applies data mutations with conflict resolution
	 */
	async handleMutation(
		ws: ServerWebSocket<WebSocketData>,
		message: MutationMessage,
	): Promise<void> {
		const startTime = Date.now();
		let success = false;
		let error: string | undefined;

		try {
			const { userId } = ws.data;
			if (!userId) {
				throw new Error("User not authenticated");
			}

			// Get tenant ID for the user
			const tenantId = await tenantIsolation.getTenantIdForUser(userId);
			if (!tenantId) {
				throw new Error("User tenant not found");
			}

			// Validate mutation if enabled
			if (this.options.validateMutations) {
				const validationResult = await mutationValidator.validateMutation(
					tenantId,
					message,
				);

				if (!validationResult.isValid) {
					throw new Error(
						validationResult.error || "Mutation validation failed",
					);
				}
			}

			// Handle conflict resolution if enabled
			if (
				this.options.enableConflictResolution &&
				message.operation !== "insert"
			) {
				const conflictResult = await conflictResolver.resolveConflict(
					tenantId,
					message,
				);

				if (!conflictResult.canProceed) {
					throw new Error(conflictResult.error || "Conflict resolution failed");
				}

				// Update message data with resolved values if needed
				if (conflictResult.resolvedData) {
					message.data = { ...message.data, ...conflictResult.resolvedData };
				}
			}

			// Apply mutation with tenant isolation
			await tenantIsolation.executeTenantScopedMutation(
				tenantId,
				userId,
				message,
			);

			success = true;
		} catch (err) {
			error = err instanceof Error ? err.message : "Unknown error occurred";
			console.error("Mutation error:", error, {
				operation: message.operation,
				table: message.table,
				userId: ws.data.userId,
			});
		}

		// Send acknowledgment
		const ack: MutationAckMessage = {
			error,
			server_timestamp: startTime,
			success,
			temp_id: message.temp_id,
			type: "mutation_ack",
		};

		ws.send(JSON.stringify(ack));
	}

	/**
	 * Broadcast changes to all connected clients in the same tenant
	 * Called when data changes need to be propagated
	 */
	async broadcastChanges(
		tenantId: string,
		changes: ChangeRecord[],
		excludeUserId?: string,
	): Promise<void> {
		if (changes.length === 0) return;

		const message: SyncDataMessage = {
			changes,
			timestamp: Date.now(),
			type: "sync_data",
		};

		const _messageStr = JSON.stringify(message);

		// This would need to be integrated with a WebSocket connection manager
		// For now, we define the interface for broadcasting
		console.log("Broadcasting changes to tenant:", tenantId, {
			changeCount: changes.length,
			excludeUserId,
		});

		// TODO: Implement actual broadcasting once WebSocket connection manager is available
		// This would iterate through all connected WebSockets for the tenant
		// and send the message to each one (except excludeUserId if specified)
	}

	/**
	 * Get current server timestamp
	 * Used for client synchronization
	 */
	getCurrentTimestamp(): number {
		return Date.now();
	}

	/**
	 * Health check for the sync engine
	 * Returns basic status information
	 */
	async getHealthStatus(): Promise<{
		status: "healthy" | "degraded" | "unhealthy";
		timestamp: number;
		details: Record<string, any>;
	}> {
		try {
			// Basic health checks
			const details: Record<string, any> = {
				engine: "operational",
				timestamp: Date.now(),
			};

			// Check change tracker
			try {
				await changeTracker.healthCheck();
				details.changeTracker = "healthy";
			} catch (error) {
				details.changeTracker = "unhealthy";
				details.changeTrackerError =
					error instanceof Error ? error.message : "Unknown error";
			}

			// Check mutation validator
			try {
				await mutationValidator.healthCheck();
				details.mutationValidator = "healthy";
			} catch (error) {
				details.mutationValidator = "unhealthy";
				details.mutationValidatorError =
					error instanceof Error ? error.message : "Unknown error";
			}

			// Check conflict resolver
			try {
				await conflictResolver.healthCheck();
				details.conflictResolver = "healthy";
			} catch (error) {
				details.conflictResolver = "unhealthy";
				details.conflictResolverError =
					error instanceof Error ? error.message : "Unknown error";
			}

			// Check tenant isolation
			try {
				await tenantIsolation.healthCheck();
				details.tenantIsolation = "healthy";
			} catch (error) {
				details.tenantIsolation = "unhealthy";
				details.tenantIsolationError =
					error instanceof Error ? error.message : "Unknown error";
			}

			// Determine overall status
			const hasUnhealthy = Object.values(details).some(
				(value) => value === "unhealthy",
			);
			const status = hasUnhealthy ? "unhealthy" : "healthy";

			return {
				details,
				status,
				timestamp: Date.now(),
			};
		} catch (error) {
			return {
				details: {
					error: error instanceof Error ? error.message : "Unknown error",
				},
				status: "unhealthy",
				timestamp: Date.now(),
			};
		}
	}
}

// Export singleton instance
export const syncEngine = new SyncEngine();
