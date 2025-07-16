import { syncDbUtils } from "../db/utils";
import type { ChangeRecord } from "./engine";

// Re-export the ChangeLogEntry interface from utils
export type { ChangeLogEntry } from "../db/utils";

export interface GetChangesSinceOptions {
	tableFilters?: string[];
	maxChanges?: number;
	userId?: string;
}

/**
 * Database change detection system for tracking data modifications
 * Handles efficient retrieval of changes since a given timestamp
 */
export class ChangeTracker {
	/**
	 * Get all changes since a specific timestamp for a tenant
	 * Returns changes in reverse chronological order (newest first)
	 */
	async getChangesSince(
		tenantId: string,
		sinceTimestamp: number,
		options: GetChangesSinceOptions = {},
	): Promise<ChangeRecord[]> {
		return await syncDbUtils.getChangesSince(tenantId, sinceTimestamp, options);
	}

	/**
	 * Record a new change in the change log
	 * Called when data is modified to track the change
	 */
	async recordChange(
		tenantId: string,
		userId: string,
		tableName: string,
		recordId: string,
		operation: "insert" | "update" | "delete",
		changeData: Record<string, any>,
	): Promise<string> {
		return await syncDbUtils.recordChange(
			tenantId,
			userId,
			tableName,
			recordId,
			operation,
			changeData,
		);
	}

	/**
	 * Get changes for a specific table and record
	 * Useful for conflict resolution and audit trails
	 */
	async getChangesForRecord(
		tenantId: string,
		tableName: string,
		recordId: string,
		limit = 10,
	): Promise<ChangeRecord[]> {
		return await syncDbUtils.getChangesForRecord(
			tenantId,
			tableName,
			recordId,
			limit,
		);
	}

	/**
	 * Get latest change timestamp for a tenant
	 * Used for client sync optimization
	 */
	async getLatestChangeTimestamp(tenantId: string): Promise<number | null> {
		return await syncDbUtils.getLatestChangeTimestamp(tenantId);
	}

	/**
	 * Clean up old change log entries
	 * Called periodically to prevent unbounded growth
	 */
	async cleanupOldChanges(
		tenantId: string,
		olderThanDays = 30,
	): Promise<number> {
		return await syncDbUtils.cleanupOldChanges(tenantId, olderThanDays);
	}

	/**
	 * Get change statistics for a tenant
	 * Useful for monitoring and debugging
	 */
	async getChangeStats(tenantId: string): Promise<{
		totalChanges: number;
		changesByTable: Record<string, number>;
		changesByOperation: Record<string, number>;
		oldestChange: Date | null;
		newestChange: Date | null;
	}> {
		return await syncDbUtils.getChangeStats(tenantId);
	}

	/**
	 * Health check for the change tracker
	 * Verifies database connectivity and basic functionality
	 */
	async healthCheck(): Promise<void> {
		return await syncDbUtils.healthCheck();
	}
}

// Export singleton instance
export const changeTracker = new ChangeTracker();
