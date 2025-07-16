/**
 * Sync Engine Core Module
 *
 * This module provides the core sync engine infrastructure for real-time data synchronization
 * in a multi-tenant environment. It handles:
 *
 * - Change tracking and efficient timestamp-based retrieval
 * - Mutation validation with schema enforcement
 * - Conflict resolution using last-write-wins strategy
 * - Tenant-based data isolation for security
 */

// Main sync engine coordinator
export { SyncEngine, syncEngine } from "./engine";

import { syncEngine } from "./engine";

export type {
	ChangeLogEntry,
	GetChangesSinceOptions,
} from "./changeTracker";
// Change tracking system
export { ChangeTracker, changeTracker } from "./changeTracker";
export type {
	ConflictContext,
	ConflictResolution,
	ConflictResolutionResult,
	ConflictRule,
	ConflictType,
} from "./conflictResolver";
// Conflict resolution system
export { ConflictResolver, conflictResolver } from "./conflictResolver";
export type {
	ChangeRecord,
	MutationAckMessage,
	MutationMessage,
	SyncDataMessage,
	SyncEngineOptions,
	SyncRequestMessage,
} from "./engine";
export type {
	CheckConstraint,
	FieldSchema,
	ForeignKeyConstraint,
	TableConstraints,
	TableSchema,
	ValidationResult,
	ValidationRule,
} from "./mutationValidator";
// Mutation validation pipeline
export { MutationValidator, mutationValidator } from "./mutationValidator";
export type {
	MutationExecutionResult,
	TenantContext,
} from "./tenantIsolation";
// Tenant isolation utilities
export { TenantIsolation, tenantIsolation } from "./tenantIsolation";

/**
 * Quick health check for all sync engine components
 * Returns overall health status
 */
export async function syncEngineHealthCheck(): Promise<{
	status: "healthy" | "degraded" | "unhealthy";
	timestamp: number;
	components: Record<string, "healthy" | "unhealthy">;
	errors?: string[];
}> {
	const timestamp = Date.now();
	const components: Record<string, "healthy" | "unhealthy"> = {};
	const errors: string[] = [];

	// Check each component
	try {
		const healthStatus = await syncEngine.getHealthStatus();
		Object.assign(components, {
			changeTracker:
				healthStatus.details.changeTracker === "healthy"
					? "healthy"
					: "unhealthy",
			conflictResolver:
				healthStatus.details.conflictResolver === "healthy"
					? "healthy"
					: "unhealthy",
			mutationValidator:
				healthStatus.details.mutationValidator === "healthy"
					? "healthy"
					: "unhealthy",
			tenantIsolation:
				healthStatus.details.tenantIsolation === "healthy"
					? "healthy"
					: "unhealthy",
		});

		// Collect errors from the detailed health check
		if (healthStatus.details.changeTrackerError) {
			errors.push(`Change Tracker: ${healthStatus.details.changeTrackerError}`);
		}
		if (healthStatus.details.mutationValidatorError) {
			errors.push(
				`Mutation Validator: ${healthStatus.details.mutationValidatorError}`,
			);
		}
		if (healthStatus.details.conflictResolverError) {
			errors.push(
				`Conflict Resolver: ${healthStatus.details.conflictResolverError}`,
			);
		}
		if (healthStatus.details.tenantIsolationError) {
			errors.push(
				`Tenant Isolation: ${healthStatus.details.tenantIsolationError}`,
			);
		}
	} catch (error) {
		// If sync engine health check fails, mark all as unhealthy
		Object.assign(components, {
			changeTracker: "unhealthy",
			conflictResolver: "unhealthy",
			mutationValidator: "unhealthy",
			tenantIsolation: "unhealthy",
		});
		errors.push(
			`Sync Engine: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}

	// Determine overall status
	const unhealthyCount = Object.values(components).filter(
		(status) => status === "unhealthy",
	).length;
	let status: "healthy" | "degraded" | "unhealthy";

	if (unhealthyCount === 0) {
		status = "healthy";
	} else if (unhealthyCount < Object.keys(components).length) {
		status = "degraded";
	} else {
		status = "unhealthy";
	}

	return {
		components,
		errors: errors.length > 0 ? errors : undefined,
		status,
		timestamp,
	};
}
