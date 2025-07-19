import { and, desc, eq, gt, inArray, lt, sql } from "drizzle-orm";

import type { ChangeRecord, MutationMessage } from "../sync/engine.js";

export interface ChangeLogEntry {
	id: string;
	tenantId: string;
	tableName: string;
	recordId: string;
	operation: "insert" | "update" | "delete";
	changeData: Record<string, any>;
	timestamp: string; // ISO string timestamp to match Drizzle schema
	userId: string;
}

export interface MutationQueueEntry {
	id: string;
	tenantId: string;
	userId: string;
	mutationData: Record<string, any>;
	status: "pending" | "processing" | "completed" | "failed";
	createdAt: string; // ISO string timestamp
	processedAt: string | null; // ISO string timestamp
	error: string | null;
	retryCount: number;
}

export interface GetChangesSinceOptions {
	tableFilters?: string[];
	maxChanges?: number;
	userId?: string;
}

/**
 * Database utilities for sync engine operations
 * Provides tenant-scoped query functions with proper isolation
 */
export class SyncDbUtils {
	/**
	 * Get all changes since a specific timestamp for a tenant
	 * Returns changes in chronological order (oldest first)
	 */
	async getChangesSince(
		tenantId: string,
		sinceTimestamp: number,
		options: GetChangesSinceOptions = {},
	): Promise<ChangeRecord[]> {
		try {
			// Convert timestamp to Date object
			const sinceDate = new Date(sinceTimestamp);

			// Build query conditions - convert Date to ISO string for comparison
			const conditions = [
				eq(changeLog.tenantId, tenantId),
				gt(changeLog.timestamp, sinceDate.toISOString()),
			];

			// Add table filters if specified
			if (options.tableFilters && options.tableFilters.length > 0) {
				conditions.push(inArray(changeLog.tableName, options.tableFilters));
			}

			// Add user filter if specified
			if (options.userId) {
				conditions.push(eq(changeLog.userId, options.userId));
			}

			// Execute query with limit
			const limit = Math.min(options.maxChanges || 100, 1000); // Cap at 1000

			const results = await db
				.select()
				.from(changeLog)
				.where(and(...conditions))
				.orderBy(changeLog.timestamp) // Chronological order for sync
				.limit(limit);

			return results.map(this.mapToChangeRecord);
		} catch (error) {
			console.error("Error retrieving changes:", error);
			throw new Error(
				`Failed to retrieve changes: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
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
		try {
			const result = await db
				.insert(changeLog)
				.values({
					changeData,
					operation,
					recordId,
					tableName,
					tenantId,
					timestamp: new Date().toISOString(),
					userId,
				})
				.returning({ id: changeLog.id });

			return result[0].id;
		} catch (error) {
			console.error("Error recording change:", error);
			throw new Error(
				`Failed to record change: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
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
		try {
			const results = await db
				.select()
				.from(changeLog)
				.where(
					and(
						eq(changeLog.tenantId, tenantId),
						eq(changeLog.tableName, tableName),
						eq(changeLog.recordId, recordId),
					),
				)
				.orderBy(desc(changeLog.timestamp))
				.limit(limit);

			return results.map(this.mapToChangeRecord);
		} catch (error) {
			console.error("Error getting changes for record:", error);
			throw new Error(
				`Failed to get changes for record: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get latest change timestamp for a tenant
	 * Used for client sync optimization
	 */
	async getLatestChangeTimestamp(tenantId: string): Promise<number | null> {
		try {
			const result = await db
				.select({ timestamp: changeLog.timestamp })
				.from(changeLog)
				.where(eq(changeLog.tenantId, tenantId))
				.orderBy(desc(changeLog.timestamp))
				.limit(1);

			return result.length > 0 ? new Date(result[0].timestamp).getTime() : null;
		} catch (error) {
			console.error("Error getting latest change timestamp:", error);
			throw new Error(
				`Failed to get latest change timestamp: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Clean up old change log entries
	 * Called periodically to prevent unbounded growth
	 */
	async cleanupOldChanges(
		tenantId: string,
		olderThanDays = 30,
	): Promise<number> {
		try {
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

			const result = await db
				.delete(changeLog)
				.where(
					and(
						eq(changeLog.tenantId, tenantId),
						lt(changeLog.timestamp, cutoffDate.toISOString()),
					),
				);

			return result.rowCount || 0;
		} catch (error) {
			console.error("Error cleaning up old changes:", error);
			throw new Error(
				`Failed to cleanup old changes: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
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
		try {
			// Get total count
			const totalResult = await db
				.select({ count: sql<number>`count(*)` })
				.from(changeLog)
				.where(eq(changeLog.tenantId, tenantId));

			const totalChanges = totalResult[0]?.count || 0;

			// Get changes by table
			const tableStats = await db
				.select({
					count: sql<number>`count(*)`,
					tableName: changeLog.tableName,
				})
				.from(changeLog)
				.where(eq(changeLog.tenantId, tenantId))
				.groupBy(changeLog.tableName);

			const changesByTable: Record<string, number> = {};
			tableStats.forEach((stat) => {
				changesByTable[stat.tableName] = stat.count;
			});

			// Get changes by operation
			const operationStats = await db
				.select({
					count: sql<number>`count(*)`,
					operation: changeLog.operation,
				})
				.from(changeLog)
				.where(eq(changeLog.tenantId, tenantId))
				.groupBy(changeLog.operation);

			const changesByOperation: Record<string, number> = {};
			operationStats.forEach((stat) => {
				changesByOperation[stat.operation] = stat.count;
			});

			// Get oldest and newest changes
			const timestampStats = await db
				.select({
					newest: sql<Date>`max(${changeLog.timestamp})`,
					oldest: sql<Date>`min(${changeLog.timestamp})`,
				})
				.from(changeLog)
				.where(eq(changeLog.tenantId, tenantId));

			const { oldest, newest } = timestampStats[0] || {};

			return {
				changesByOperation,
				changesByTable,
				newestChange: newest || null,
				oldestChange: oldest || null,
				totalChanges,
			};
		} catch (error) {
			console.error("Error getting change stats:", error);
			throw new Error(
				`Failed to get change stats: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Add mutation to processing queue
	 */
	async enqueueMutation(
		tenantId: string,
		userId: string,
		mutation: MutationMessage,
	): Promise<string> {
		try {
			const result = await db
				.insert(mutationQueue)
				.values({
					createdAt: new Date().toISOString(),
					mutationData: mutation as any,
					retryCount: 0,
					status: "pending",
					tenantId,
					userId,
				})
				.returning({ id: mutationQueue.id });

			return result[0].id;
		} catch (error) {
			console.error("Error enqueueing mutation:", error);
			throw new Error(
				`Failed to enqueue mutation: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get next pending mutations for processing
	 */
	async getNextPendingMutations(
		tenantId: string,
		limit = 10,
	): Promise<MutationQueueEntry[]> {
		try {
			const results = await db
				.select()
				.from(mutationQueue)
				.where(
					and(
						eq(mutationQueue.tenantId, tenantId),
						eq(mutationQueue.status, "pending"),
					),
				)
				.orderBy(mutationQueue.createdAt)
				.limit(limit);

			return results.map(this.mapToMutationQueueEntry);
		} catch (error) {
			console.error("Error getting pending mutations:", error);
			throw new Error(
				`Failed to get pending mutations: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Update mutation status
	 */
	async updateMutationStatus(
		tenantId: string,
		mutationId: string,
		status: "processing" | "completed" | "failed",
		error?: string,
	): Promise<void> {
		try {
			const updateData: any = {
				processedAt: new Date().toISOString(),
				status,
			};

			if (error) {
				updateData.error = error;
				updateData.retryCount = sql`${mutationQueue.retryCount} + 1`;
			}

			await db
				.update(mutationQueue)
				.set(updateData)
				.where(
					and(
						eq(mutationQueue.tenantId, tenantId),
						eq(mutationQueue.id, mutationId),
					),
				);
		} catch (error) {
			console.error("Error updating mutation status:", error);
			throw new Error(
				`Failed to update mutation status: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Clean up old completed mutations
	 */
	async cleanupOldMutations(
		tenantId: string,
		olderThanDays = 7,
	): Promise<number> {
		try {
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

			const result = await db
				.delete(mutationQueue)
				.where(
					and(
						eq(mutationQueue.tenantId, tenantId),
						eq(mutationQueue.status, "completed"),
						lt(mutationQueue.processedAt, cutoffDate.toISOString()),
					),
				);

			return result.rowCount || 0;
		} catch (error) {
			console.error("Error cleaning up old mutations:", error);
			throw new Error(
				`Failed to cleanup old mutations: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Verify tenant exists and is active
	 */
	async verifyTenantExists(tenantId: string): Promise<boolean> {
		try {
			const result = await db
				.select({ id: tenants.id })
				.from(tenants)
				.where(
					and(
						eq(tenants.id, tenantId),
						// Check tenant is not deleted (if deleted field exists)
						// sql`${tenants.deleted} IS NULL`
					),
				)
				.limit(1);

			return result.length > 0;
		} catch (error) {
			console.error("Error verifying tenant exists:", error);
			return false;
		}
	}

	/**
	 * Get tenant information
	 */
	async getTenantInfo(tenantId: string): Promise<{
		id: string;
		name: string | null;
		created: string;
		active: boolean;
	} | null> {
		try {
			const result = await db
				.select({
					created: tenants.created,
					deleted: tenants.deleted,
					id: tenants.id,
					name: tenants.name,
				})
				.from(tenants)
				.where(eq(tenants.id, tenantId))
				.limit(1);

			if (result.length === 0) {
				return null;
			}

			const tenant = result[0];
			return {
				active: !tenant.deleted,
				created: tenant.created,
				id: tenant.id,
				name: tenant.name, // Active if not deleted
			};
		} catch (error) {
			console.error("Error getting tenant info:", error);
			return null;
		}
	}

	/**
	 * Health check for database operations
	 */
	async healthCheck(): Promise<void> {
		try {
			// Test basic database connectivity
			await db.execute(sql`SELECT 1`);

			// Test table access
			await db
				.select({ count: sql<number>`count(*)` })
				.from(changeLog)
				.limit(1);
			await db
				.select({ count: sql<number>`count(*)` })
				.from(mutationQueue)
				.limit(1);
			await db.select({ count: sql<number>`count(*)` }).from(tenants).limit(1);

			console.log("Sync database health check passed");
		} catch (error) {
			console.error("Sync database health check failed:", error);
			throw new Error(
				`Sync database unhealthy: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Map database result to ChangeRecord interface
	 */
	private mapToChangeRecord(dbResult: any): ChangeRecord {
		return {
			change_data: dbResult.changeData || {},
			id: dbResult.id,
			operation: dbResult.operation,
			record_id: dbResult.recordId,
			table_name: dbResult.tableName,
			timestamp: new Date(dbResult.timestamp).getTime(),
			user_id: dbResult.userId,
		};
	}

	/**
	 * Map database result to MutationQueueEntry interface
	 */
	private mapToMutationQueueEntry(dbResult: any): MutationQueueEntry {
		return {
			createdAt: dbResult.createdAt,
			error: dbResult.error,
			id: dbResult.id,
			mutationData: dbResult.mutationData,
			processedAt: dbResult.processedAt,
			retryCount: dbResult.retryCount,
			status: dbResult.status,
			tenantId: dbResult.tenantId,
			userId: dbResult.userId,
		};
	}
}

// Export singleton instance
export const syncDbUtils = new SyncDbUtils();
