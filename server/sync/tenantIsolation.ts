import { tenantUtils } from "../db/tenantUtils";
import { syncDbUtils } from "../db/utils";
import { changeTracker } from "./changeTracker";
import type { MutationMessage } from "./engine";

export interface TenantContext {
	tenantId: string;
	userId: string;
	permissions?: string[];
}

export interface MutationExecutionResult {
	success: boolean;
	recordId?: string;
	error?: string;
	timestamp: number;
}

/**
 * Tenant-based data filtering utilities for Nile database
 * Ensures all operations are properly scoped to user's tenant
 */
export class TenantIsolation {
	/**
	 * Get tenant ID for a given user
	 * This should integrate with your authentication system
	 */
	async getTenantIdForUser(userId: string): Promise<string | null> {
		return await tenantUtils.getTenantIdForUser(userId);
	}

	/**
	 * Validate that a user belongs to a specific tenant
	 */
	async validateUserTenantAccess(
		userId: string,
		tenantId: string,
	): Promise<boolean> {
		return await tenantUtils.validateUserTenantAccess(userId, tenantId);
	}

	/**
	 * Get tenant context for a user
	 * Includes tenant ID and any relevant permissions
	 */
	async getTenantContext(userId: string): Promise<TenantContext | null> {
		try {
			const tenantId = await this.getTenantIdForUser(userId);
			if (!tenantId) {
				return null;
			}

			// TODO: Add permission checking logic here
			// This could integrate with a role-based access control system

			return {
				permissions: [],
				tenantId,
				userId, // TODO: Load actual permissions
			};
		} catch (error) {
			console.error("Error getting tenant context:", error);
			return null;
		}
	}

	/**
	 * Execute a tenant-scoped mutation
	 * Ensures the mutation is applied only within the user's tenant
	 */
	async executeTenantScopedMutation(
		tenantId: string,
		userId: string,
		mutation: MutationMessage,
	): Promise<MutationExecutionResult> {
		const timestamp = Date.now();

		try {
			// Validate tenant access
			const hasAccess = await this.validateUserTenantAccess(userId, tenantId);
			if (!hasAccess) {
				return {
					error: "User does not have access to this tenant",
					success: false,
					timestamp,
				};
			}

			// Ensure mutation data includes tenant scope
			const scopedData = {
				...mutation.data,
				tenant_id: tenantId,
				updated: new Date(timestamp).toISOString(),
			};

			// Add user_id for audit trail if not present
			if (!("user_id" in scopedData)) {
				(scopedData as any).user_id = userId;
			}

			let recordId: string;

			// Execute the mutation based on operation type
			switch (mutation.operation) {
				case "insert":
					recordId = await this.executeInsert(
						tenantId,
						mutation.table,
						scopedData,
					);
					break;

				case "update":
					recordId = await this.executeUpdate(
						tenantId,
						mutation.table,
						scopedData,
					);
					break;

				case "delete":
					recordId = await this.executeDelete(
						tenantId,
						mutation.table,
						scopedData,
					);
					break;

				default:
					throw new Error(`Unsupported operation: ${mutation.operation}`);
			}

			// Record the change in change log
			await changeTracker.recordChange(
				tenantId,
				userId,
				mutation.table,
				recordId,
				mutation.operation,
				scopedData,
			);

			return {
				recordId,
				success: true,
				timestamp,
			};
		} catch (error) {
			console.error("Error executing tenant-scoped mutation:", error);
			return {
				error: error instanceof Error ? error.message : "Unknown error",
				success: false,
				timestamp,
			};
		}
	}

	/**
	 * Execute tenant-scoped INSERT operation
	 */
	private async executeInsert(
		tenantId: string,
		tableName: string,
		data: Record<string, any>,
	): Promise<string> {
		console.log("Executing tenant-scoped INSERT:", {
			data,
			tableName,
			tenantId,
		});

		// TODO: This needs to be implemented with actual table mappings
		// For now, we'll simulate the operation
		const recordId = data.id || `generated-id-${Date.now()}`;

		// TODO: Implement actual database insert with table mapping
		// This would require a table registry or dynamic table resolution

		return recordId;
	}

	/**
	 * Execute tenant-scoped UPDATE operation
	 */
	private async executeUpdate(
		tenantId: string,
		tableName: string,
		data: Record<string, any>,
	): Promise<string> {
		console.log("Executing tenant-scoped UPDATE:", {
			data,
			tableName,
			tenantId,
		});

		const recordId = data.id;
		if (!recordId) {
			throw new Error("UPDATE operation requires record ID");
		}

		// TODO: Implement actual database update with table mapping
		// This would require a table registry or dynamic table resolution

		return recordId;
	}

	/**
	 * Execute tenant-scoped DELETE operation
	 */
	private async executeDelete(
		tenantId: string,
		tableName: string,
		data: Record<string, any>,
	): Promise<string> {
		console.log("Executing tenant-scoped DELETE:", {
			data,
			tableName,
			tenantId,
		});

		const recordId = data.id;
		if (!recordId) {
			throw new Error("DELETE operation requires record ID");
		}

		// TODO: Implement actual database delete with table mapping
		// This would require a table registry or dynamic table resolution

		return recordId;
	}

	/**
	 * Get tenant-scoped query builder
	 * Returns a query builder that automatically includes tenant filtering
	 */
	createTenantScopedQuery(tenantId: string) {
		return {
			tenantId,
			// TODO: Add query builder methods that automatically include tenant filtering
			// This would be used by other parts of the sync engine to ensure all queries are tenant-scoped
		};
	}

	/**
	 * Verify tenant exists and is active
	 */
	async verifyTenantExists(tenantId: string): Promise<boolean> {
		return await syncDbUtils.verifyTenantExists(tenantId);
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
		const info = await syncDbUtils.getTenantInfo(tenantId);
		if (!info) return null;

		return {
			active: info.active,
			created: info.created,
			id: info.id,
			name: info.name,
		};
	}

	/**
	 * List all tenants (admin function)
	 * Should be restricted to admin users only
	 */
	async listTenants(
		limit = 50,
		offset = 0,
	): Promise<
		{
			id: string;
			name: string | null;
			created: string;
			active: boolean;
		}[]
	> {
		const tenants = await tenantUtils.listTenants(limit, offset);
		return tenants.map((tenant) => ({
			active: tenant.active,
			created: tenant.created,
			id: tenant.id,
			name: tenant.name,
		}));
	}

	/**
	 * Health check for tenant isolation
	 */
	async healthCheck(): Promise<void> {
		await tenantUtils.healthCheck();
	}
}

// Export singleton instance
export const tenantIsolation = new TenantIsolation();
