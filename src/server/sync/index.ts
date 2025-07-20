// // Main sync engine coordinator
// export { SyncEngine, syncEngine } from "./engine.js";

// import { syncEngine } from "./engine.js";

// export type {
// 	ChangeLogEntry,
// 	GetChangesSinceOptions,
// } from "./changeTracker.js";
// // Change tracking system
// export { ChangeTracker, changeTracker } from "./changeTracker.js";
// export type {
// 	ConflictContext,
// 	ConflictResolution,
// 	ConflictResolutionResult,
// 	ConflictRule,
// 	ConflictType,
// } from "./conflictResolver.js";
// // Conflict resolution system
// export { ConflictResolver, conflictResolver } from "./conflictResolver.js";
// export type {
// 	ChangeRecord,
// 	MutationAckMessage,
// 	MutationMessage,
// 	SyncDataMessage,
// 	SyncEngineOptions,
// 	SyncRequestMessage,
// } from "./engine.js";
// export type {
// 	CheckConstraint,
// 	FieldSchema,
// 	ForeignKeyConstraint,
// 	TableConstraints,
// 	TableSchema,
// 	ValidationResult,
// 	ValidationRule,
// } from "./mutationValidator.js";
// // Mutation validation pipeline
// export { MutationValidator, mutationValidator } from "./mutationValidator.js";
// export type {
// 	MutationExecutionResult,
// 	TenantContext,
// } from "./tenantIsolation.js";
// // Tenant isolation utilities
// export { TenantIsolation, tenantIsolation } from "./tenantIsolation.js";

// /**
//  * Quick health check for all sync engine components
//  * Returns overall health status
//  */
// export async function syncEngineHealthCheck(): Promise<{
// 	status: "healthy" | "degraded" | "unhealthy";
// 	timestamp: number;
// 	components: Record<string, "healthy" | "unhealthy">;
// 	errors?: string[];
// }> {
// 	const timestamp = Date.now();
// 	const components: Record<string, "healthy" | "unhealthy"> = {};
// 	const errors: string[] = [];

// 	// Check each component
// 	try {
// 		const healthStatus = await syncEngine.getHealthStatus();
// 		Object.assign(components, {
// 			changeTracker:
// 				healthStatus.details.changeTracker === "healthy"
// 					? "healthy"
// 					: "unhealthy",
// 			conflictResolver:
// 				healthStatus.details.conflictResolver === "healthy"
// 					? "healthy"
// 					: "unhealthy",
// 			mutationValidator:
// 				healthStatus.details.mutationValidator === "healthy"
// 					? "healthy"
// 					: "unhealthy",
// 			tenantIsolation:
// 				healthStatus.details.tenantIsolation === "healthy"
// 					? "healthy"
// 					: "unhealthy",
// 		});

// 		// Collect errors from the detailed health check
// 		if (healthStatus.details.changeTrackerError) {
// 			errors.push(`Change Tracker: ${healthStatus.details.changeTrackerError}`);
// 		}
// 		if (healthStatus.details.mutationValidatorError) {
// 			errors.push(
// 				`Mutation Validator: ${healthStatus.details.mutationValidatorError}`,
// 			);
// 		}
// 		if (healthStatus.details.conflictResolverError) {
// 			errors.push(
// 				`Conflict Resolver: ${healthStatus.details.conflictResolverError}`,
// 			);
// 		}
// 		if (healthStatus.details.tenantIsolationError) {
// 			errors.push(
// 				`Tenant Isolation: ${healthStatus.details.tenantIsolationError}`,
// 			);
// 		}
// 	} catch (error) {
// 		// If sync engine health check fails, mark all as unhealthy
// 		Object.assign(components, {
// 			changeTracker: "unhealthy",
// 			conflictResolver: "unhealthy",
// 			mutationValidator: "unhealthy",
// 			tenantIsolation: "unhealthy",
// 		});
// 		errors.push(
// 			`Sync Engine: ${error instanceof Error ? error.message : "Unknown error"}`,
// 		);
// 	}

// 	// Determine overall status
// 	const unhealthyCount = Object.values(components).filter(
// 		(status) => status === "unhealthy",
// 	).length;
// 	let status: "healthy" | "degraded" | "unhealthy";

// 	if (unhealthyCount === 0) {
// 		status = "healthy";
// 	} else if (unhealthyCount < Object.keys(components).length) {
// 		status = "degraded";
// 	} else {
// 		status = "unhealthy";
// 	}

// 	return {
// 		components,
// 		errors: errors.length > 0 ? errors : undefined,
// 		status,
// 		timestamp,
// 	};
// }
