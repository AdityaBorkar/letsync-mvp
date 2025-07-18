import { changeTracker } from "./changeTracker.js";
import type { MutationMessage } from "./engine.js";

export interface ConflictResolutionResult {
	canProceed: boolean;
	error?: string;
	resolvedData?: Record<string, any>;
	conflictType?: ConflictType;
	resolution?: ConflictResolution;
}

export type ConflictType =
	| "concurrent_update"
	| "delete_conflict"
	| "create_conflict"
	| "version_mismatch";

export type ConflictResolution =
	| "last_write_wins"
	| "client_wins"
	| "server_wins"
	| "merge_fields"
	| "reject";

export interface ConflictRule {
	table: string;
	field?: string;
	resolution: ConflictResolution;
	customResolver?: (
		clientData: Record<string, any>,
		serverData: Record<string, any>,
		context: ConflictContext,
	) => Record<string, any> | null;
}

export interface ConflictContext {
	tenantId: string;
	userId: string;
	tableName: string;
	recordId: string;
	operation: "insert" | "update" | "delete";
	clientTimestamp: number;
	serverTimestamp: number;
}

/**
 * Data conflict resolution logic for concurrent edits
 * Implements last-write-wins strategy with customizable rules
 */
export class ConflictResolver {
	private conflictRules: Map<string, ConflictRule[]> = new Map();

	constructor() {
		this.initializeDefaultRules();
	}

	/**
	 * Resolve conflicts for a mutation
	 * Returns whether the mutation can proceed and any resolved data
	 */
	async resolveConflict(
		tenantId: string,
		mutation: MutationMessage,
	): Promise<ConflictResolutionResult> {
		try {
			// For insert operations, check for duplicate keys
			if (mutation.operation === "insert") {
				return await this.resolveInsertConflict(tenantId, mutation);
			}

			// For update/delete operations, check for concurrent modifications
			if (mutation.operation === "update" || mutation.operation === "delete") {
				return await this.resolveConcurrentConflict(tenantId, mutation);
			}

			return { canProceed: true };
		} catch (error) {
			return {
				canProceed: false,
				error: `Conflict resolution error: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
		}
	}

	/**
	 * Register a conflict resolution rule for a table/field
	 */
	addConflictRule(rule: ConflictRule): void {
		const key = rule.field ? `${rule.table}.${rule.field}` : rule.table;
		const rules = this.conflictRules.get(key) || [];
		rules.push(rule);
		this.conflictRules.set(key, rules);
	}

	/**
	 * Get conflict rules for a table/field
	 */
	private getConflictRules(table: string, field?: string): ConflictRule[] {
		const rules: ConflictRule[] = [];

		// Get table-level rules
		const tableRules = this.conflictRules.get(table) || [];
		rules.push(...tableRules);

		// Get field-level rules if specified
		if (field) {
			const fieldRules = this.conflictRules.get(`${table}.${field}`) || [];
			rules.push(...fieldRules);
		}

		return rules;
	}

	/**
	 * Resolve conflicts for insert operations
	 * Checks for duplicate keys and primary key conflicts
	 */
	private async resolveInsertConflict(
		tenantId: string,
		mutation: MutationMessage,
	): Promise<ConflictResolutionResult> {
		// TODO: Check if record with same ID already exists
		// This would require a database query to check for existing records

		const recordId = mutation.data.id;
		if (!recordId) {
			return {
				canProceed: false,
				conflictType: "create_conflict",
				error: "Insert operation missing record ID",
			};
		}

		// Log the conflict check intent
		console.log("Checking insert conflict:", {
			recordId,
			table: mutation.table,
			tenantId,
		});

		// TODO: Implement actual database check when tables are available
		/*
		const existingRecord = await this.checkRecordExists(tenantId, mutation.table, recordId);
		if (existingRecord) {
			const rules = this.getConflictRules(mutation.table);
			const rule = rules.find(r => !r.field) || { resolution: 'reject' as const };

			switch (rule.resolution) {
				case 'client_wins':
					// Convert to update operation
					return {
						canProceed: true,
						resolvedData: mutation.data,
						conflictType: 'create_conflict',
						resolution: 'client_wins',
					};

				case 'server_wins':
				case 'reject':
				default:
					return {
						canProceed: false,
						error: 'Record already exists',
						conflictType: 'create_conflict',
						resolution: 'reject',
					};
			}
		}
		*/

		return { canProceed: true };
	}

	/**
	 * Resolve conflicts for concurrent update/delete operations
	 * Implements last-write-wins with timestamp comparison
	 */
	private async resolveConcurrentConflict(
		tenantId: string,
		mutation: MutationMessage,
	): Promise<ConflictResolutionResult> {
		const recordId = mutation.data.id;
		if (!recordId) {
			return {
				canProceed: false,
				error: "Update/delete operation missing record ID",
			};
		}

		// Get recent changes for this record
		const recentChanges = await changeTracker.getChangesForRecord(
			tenantId,
			mutation.table,
			recordId,
			5, // Get last 5 changes
		);

		if (recentChanges.length === 0) {
			// No recent changes, operation can proceed
			return { canProceed: true };
		}

		// Find the most recent change
		const latestChange = recentChanges[0];
		const serverTimestamp = latestChange.timestamp;
		const clientTimestamp = mutation.client_timestamp;

		// Check for concurrent modifications
		const timeDifference = Math.abs(serverTimestamp - clientTimestamp);
		const conflictThreshold = 1000; // 1 second threshold

		if (timeDifference < conflictThreshold) {
			// Potential conflict detected
			return await this.resolveTimestampConflict(
				tenantId,
				mutation,
				latestChange,
			);
		}

		// No conflict, but check if client data is newer
		if (clientTimestamp > serverTimestamp) {
			return { canProceed: true };
		}

		// Server data is newer, apply conflict resolution rules
		return await this.applyConflictRules(tenantId, mutation, latestChange);
	}

	/**
	 * Resolve timestamp-based conflicts
	 */
	private async resolveTimestampConflict(
		tenantId: string,
		mutation: MutationMessage,
		latestChange: any,
	): Promise<ConflictResolutionResult> {
		const context: ConflictContext = {
			clientTimestamp: mutation.client_timestamp,
			operation: mutation.operation,
			recordId: mutation.data.id,
			serverTimestamp: latestChange.timestamp,
			tableName: mutation.table,
			tenantId,
			userId: mutation.data.user_id || "",
		};

		// Get applicable conflict rules
		const rules = this.getConflictRules(mutation.table);
		const defaultRule: ConflictRule = {
			resolution: "last_write_wins",
			table: mutation.table,
		};
		const rule = rules[0] || defaultRule;

		switch (rule.resolution) {
			case "last_write_wins":
				// Client timestamp wins if newer
				return {
					canProceed: mutation.client_timestamp >= latestChange.timestamp,
					conflictType: "concurrent_update",
					error:
						mutation.client_timestamp < latestChange.timestamp
							? "Server data is newer"
							: undefined,
					resolution: "last_write_wins",
				};

			case "client_wins":
				return {
					canProceed: true,
					conflictType: "concurrent_update",
					resolution: "client_wins",
				};

			case "server_wins":
				return {
					canProceed: false,
					conflictType: "concurrent_update",
					error: "Server data takes precedence",
					resolution: "server_wins",
				};

			case "merge_fields":
				return await this.mergeFields(
					mutation.data,
					latestChange.change_data,
					context,
					rule,
				);
			default:
				return {
					canProceed: false,
					conflictType: "concurrent_update",
					error: "Concurrent modification detected",
					resolution: "reject",
				};
		}
	}

	/**
	 * Apply conflict resolution rules
	 */
	private async applyConflictRules(
		tenantId: string,
		mutation: MutationMessage,
		latestChange: any,
	): Promise<ConflictResolutionResult> {
		const rules = this.getConflictRules(mutation.table);

		// If no specific rules, use last-write-wins
		if (rules.length === 0) {
			return {
				canProceed: mutation.client_timestamp >= latestChange.timestamp,
				conflictType: "version_mismatch",
				resolution: "last_write_wins",
			};
		}

		// Apply first matching rule
		const rule = rules[0];
		const context: ConflictContext = {
			clientTimestamp: mutation.client_timestamp,
			operation: mutation.operation,
			recordId: mutation.data.id,
			serverTimestamp: latestChange.timestamp,
			tableName: mutation.table,
			tenantId,
			userId: mutation.data.user_id || "",
		};

		if (rule.customResolver) {
			const resolvedData = rule.customResolver(
				mutation.data,
				latestChange.change_data,
				context,
			);

			return {
				canProceed: resolvedData !== null,
				conflictType: "version_mismatch",
				resolution: rule.resolution,
				resolvedData: resolvedData || undefined,
			};
		}

		// Apply standard resolution
		switch (rule.resolution) {
			case "client_wins":
				return { canProceed: true, resolution: "client_wins" };

			case "server_wins":
				return {
					canProceed: false,
					error: "Server version is newer",
					resolution: "server_wins",
				};
			default:
				return {
					canProceed: mutation.client_timestamp >= latestChange.timestamp,
					resolution: "last_write_wins",
				};
		}
	}

	/**
	 * Merge fields from client and server data
	 */
	private async mergeFields(
		clientData: Record<string, any>,
		serverData: Record<string, any>,
		context: ConflictContext,
		rule: ConflictRule,
	): Promise<ConflictResolutionResult> {
		try {
			const mergedData = { ...serverData };

			// If custom resolver is provided, use it
			if (rule.customResolver) {
				const resolved = rule.customResolver(clientData, serverData, context);
				if (resolved === null) {
					return {
						canProceed: false,
						conflictType: "concurrent_update",
						error: "Custom merge resolver rejected the conflict",
						resolution: "reject",
					};
				}
				return {
					canProceed: true,
					conflictType: "concurrent_update",
					resolution: "merge_fields",
					resolvedData: resolved,
				};
			}

			// Default field merging: client fields win for non-system fields
			const systemFields = new Set(["id", "created", "updated", "tenant_id"]);

			for (const [key, value] of Object.entries(clientData)) {
				if (!systemFields.has(key)) {
					mergedData[key] = value;
				}
			}

			// Always update the timestamp to client's timestamp
			mergedData.updated = new Date(context.clientTimestamp).toISOString();

			return {
				canProceed: true,
				conflictType: "concurrent_update",
				resolution: "merge_fields",
				resolvedData: mergedData,
			};
		} catch (error) {
			return {
				canProceed: false,
				conflictType: "concurrent_update",
				error: `Field merge failed: ${error instanceof Error ? error.message : "Unknown error"}`,
				resolution: "reject",
			};
		}
	}

	/**
	 * Initialize default conflict resolution rules
	 */
	private initializeDefaultRules(): void {
		// Default rule for tenant table - server wins for system fields
		this.addConflictRule({
			customResolver: (clientData, serverData, context) => {
				// Keep server values for system fields
				const merged = { ...clientData };
				merged.id = serverData.id;
				merged.created = serverData.created;
				merged.tenant_id = serverData.tenant_id;

				// Client wins for user-editable fields
				merged.updated = new Date(context.clientTimestamp).toISOString();

				return merged;
			},
			resolution: "merge_fields",
			table: "tenants",
		});

		// TODO: Add more table-specific conflict rules as needed
		// These should be defined based on business requirements
	}

	/**
	 * Health check for the conflict resolver
	 */
	async healthCheck(): Promise<void> {
		try {
			// Test basic conflict resolution functionality without database queries
			// Just verify the conflict resolution logic works
			const testMutation: MutationMessage = {
				client_timestamp: Date.now() - 1000, // Older timestamp
				data: {
					id: "0197bae0-5f9d-7d5e-9a45-13f838655d33",
					name: "test-name",
				},
				operation: "insert", // Use insert to avoid database lookup
				table: "test_table",
				type: "mutation",
			};

			// Use a dummy tenant ID - insert operations don't need existing records
			const testTenantId = "0197bae0-5f9d-7d5e-9a45-13f838655d44";
			const result = await this.resolveConflict(testTenantId, testMutation);

			// Should be able to proceed for insert operations
			if (!(result.canProceed || result.error?.includes("not found"))) {
				throw new Error("Basic conflict resolution test failed");
			}

			console.log("Conflict resolver health check passed");
		} catch (error) {
			console.error("Conflict resolver health check failed:", error);
			throw new Error(
				`Conflict resolver unhealthy: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}
}

// Export singleton instance
export const conflictResolver = new ConflictResolver();
