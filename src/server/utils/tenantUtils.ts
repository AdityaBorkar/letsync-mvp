// import { eq, sql } from "drizzle-orm";

// /**
//  * Tenant relationship utilities for sync engine
//  * Handles user-tenant mapping and access control
//  */
// export class TenantUtils {
// 	/**
// 	 * Get tenant ID for a given user
// 	 * This integrates with the authentication system to determine user's tenant
// 	 */
// 	async getTenantIdForUser(userId: string): Promise<string | null> {
// 		try {
// 			// TOD This should query the actual user-tenant relationship
// 			// For now, we'll create a default tenant or use a mapping strategy

// 			// In a real system, this would look something like:
// 			// const result = await db
// 			//   .select({ tenantId: userTenants.tenantId })
// 			//   .from(userTenants)
// 			//   .where(eq(userTenants.userId, userId))
// 			//   .limit(1);
// 			// return result[0]?.tenantId || null;

// 			// For development purposes, we'll create/use a default tenant
// 			const defaultTenantId = await this.getOrCreateDefaultTenant();

// 			console.log("Getting tenant ID for user:", {
// 				tenantId: defaultTenantId,
// 				userId,
// 			});
// 			return defaultTenantId;
// 		} catch (error) {
// 			console.error("Error getting tenant ID for user:", error);
// 			return null;
// 		}
// 	}

// 	/**
// 	 * Validate that a user belongs to a specific tenant
// 	 */
// 	async validateUserTenantAccess(
// 		userId: string,
// 		tenantId: string,
// 	): Promise<boolean> {
// 		try {
// 			const userTenantId = await this.getTenantIdForUser(userId);
// 			return userTenantId === tenantId;
// 		} catch (error) {
// 			console.error("Error validating user tenant access:", error);
// 			return false;
// 		}
// 	}

// 	/**
// 	 * Get or create a default tenant for development
// 	 * In production, this would be replaced with proper tenant management
// 	 */
// 	private async getOrCreateDefaultTenant(): Promise<string> {
// 		try {
// 			// Check if default tenant exists
// 			const existing = await db
// 				.select({ id: tenants.id })
// 				.from(tenants)
// 				.where(eq(tenants.name, "Default Tenant"))
// 				.limit(1);

// 			if (existing.length > 0) {
// 				return existing[0].id;
// 			}

// 			// Create default tenant
// 			const result = await db
// 				.insert(tenants)
// 				.values({
// 					created: new Date().toISOString(),
// 					name: "Default Tenant",
// 					updated: new Date().toISOString(),
// 				})
// 				.returning({ id: tenants.id });

// 			console.log("Created default tenant:", result[0].id);
// 			return result[0].id;
// 		} catch (error) {
// 			console.error("Error getting/creating default tenant:", error);
// 			throw new Error("Failed to initialize tenant");
// 		}
// 	}

// 	/**
// 	 * Create a new tenant
// 	 */
// 	async createTenant(name: string, computeId?: string): Promise<string> {
// 		try {
// 			const result = await db
// 				.insert(tenants)
// 				.values({
// 					computeId,
// 					created: new Date().toISOString(),
// 					name,
// 					updated: new Date().toISOString(),
// 				})
// 				.returning({ id: tenants.id });

// 			return result[0].id;
// 		} catch (error) {
// 			console.error("Error creating tenant:", error);
// 			throw new Error(
// 				`Failed to create tenant: ${error instanceof Error ? error.message : "Unknown error"}`,
// 			);
// 		}
// 	}

// 	/**
// 	 * Get tenant information
// 	 */
// 	async getTenantInfo(tenantId: string): Promise<{
// 		id: string;
// 		name: string | null;
// 		computeId: string | null;
// 		created: string;
// 		updated: string;
// 		active: boolean;
// 	} | null> {
// 		try {
// 			const result = await db
// 				.select({
// 					computeId: tenants.computeId,
// 					created: tenants.created,
// 					deleted: tenants.deleted,
// 					id: tenants.id,
// 					name: tenants.name,
// 					updated: tenants.updated,
// 				})
// 				.from(tenants)
// 				.where(eq(tenants.id, tenantId))
// 				.limit(1);

// 			if (result.length === 0) {
// 				return null;
// 			}

// 			const tenant = result[0];
// 			return {
// 				active: !tenant.deleted,
// 				computeId: tenant.computeId,
// 				created: tenant.created,
// 				id: tenant.id,
// 				name: tenant.name,
// 				updated: tenant.updated, // Active if not deleted
// 			};
// 		} catch (error) {
// 			console.error("Error getting tenant info:", error);
// 			return null;
// 		}
// 	}

// 	/**
// 	 * List all active tenants (admin function)
// 	 */
// 	async listTenants(
// 		limit = 50,
// 		offset = 0,
// 	): Promise<
// 		{
// 			id: string;
// 			name: string | null;
// 			computeId: string | null;
// 			created: string;
// 			updated: string;
// 			active: boolean;
// 		}[]
// 	> {
// 		try {
// 			const results = await db
// 				.select({
// 					computeId: tenants.computeId,
// 					created: tenants.created,
// 					deleted: tenants.deleted,
// 					id: tenants.id,
// 					name: tenants.name,
// 					updated: tenants.updated,
// 				})
// 				.from(tenants)
// 				.where(sql`${tenants.deleted} IS NULL`) // Only active tenants
// 				.limit(limit)
// 				.offset(offset);

// 			return results.map((tenant) => ({
// 				active: !tenant.deleted,
// 				computeId: tenant.computeId,
// 				created: tenant.created,
// 				id: tenant.id,
// 				name: tenant.name,
// 				updated: tenant.updated,
// 			}));
// 		} catch (error) {
// 			console.error("Error listing tenants:", error);
// 			return [];
// 		}
// 	}

// 	/**
// 	 * Soft delete a tenant
// 	 */
// 	async deleteTenant(tenantId: string): Promise<boolean> {
// 		try {
// 			const result = await db
// 				.update(tenants)
// 				.set({
// 					deleted: new Date().toISOString(),
// 					updated: new Date().toISOString(),
// 				})
// 				.where(eq(tenants.id, tenantId));

// 			return (result.rowCount || 0) > 0;
// 		} catch (error) {
// 			console.error("Error deleting tenant:", error);
// 			return false;
// 		}
// 	}

// 	/**
// 	 * Update tenant information
// 	 */
// 	async updateTenant(
// 		tenantId: string,
// 		updates: { name?: string; computeId?: string },
// 	): Promise<boolean> {
// 		try {
// 			const result = await db
// 				.update(tenants)
// 				.set({
// 					...updates,
// 					updated: new Date().toISOString(),
// 				})
// 				.where(eq(tenants.id, tenantId));

// 			return (result.rowCount || 0) > 0;
// 		} catch (error) {
// 			console.error("Error updating tenant:", error);
// 			return false;
// 		}
// 	}

// 	/**
// 	 * Get tenant stats
// 	 */
// 	async getTenantStats(tenantId: string): Promise<{
// 		changeLogEntries: number;
// 		pendingMutations: number;
// 		completedMutations: number;
// 		failedMutations: number;
// 	}> {
// 		try {
// 			// Get change log count
// 			const changeLogCount = await db
// 				.select({ count: sql<number>`count(*)` })
// 				.from("change_log" as any)
// 				.where(sql`tenant_id = ${tenantId}`);

// 			// Get mutation queue stats
// 			const mutationStats = await db
// 				.select({
// 					count: sql<number>`count(*)`,
// 					status: sql`status`,
// 				})
// 				.from("mutation_queue" as any)
// 				.where(sql`tenant_id = ${tenantId}`)
// 				.groupBy(sql`status`);

// 			const stats = {
// 				changeLogEntries: changeLogCount[0]?.count || 0,
// 				completedMutations: 0,
// 				failedMutations: 0,
// 				pendingMutations: 0,
// 			};

// 			mutationStats.forEach((stat: any) => {
// 				switch (stat.status) {
// 					case "pending":
// 						stats.pendingMutations = stat.count;
// 						break;
// 					case "completed":
// 						stats.completedMutations = stat.count;
// 						break;
// 					case "failed":
// 						stats.failedMutations = stat.count;
// 						break;
// 				}
// 			});

// 			return stats;
// 		} catch (error) {
// 			console.error("Error getting tenant stats:", error);
// 			return {
// 				changeLogEntries: 0,
// 				completedMutations: 0,
// 				failedMutations: 0,
// 				pendingMutations: 0,
// 			};
// 		}
// 	}

// 	/**
// 	 * Health check for tenant operations
// 	 */
// 	async healthCheck(): Promise<void> {
// 		try {
// 			// Test database connectivity and tenant table access
// 			await db.select({ count: sql<number>`count(*)` }).from(tenants).limit(1);
// 			console.log("Tenant utils health check passed");
// 		} catch (error) {
// 			console.error("Tenant utils health check failed:", error);
// 			throw new Error(
// 				`Tenant utils unhealthy: ${error instanceof Error ? error.message : "Unknown error"}`,
// 			);
// 		}
// 	}
// }

// // Export singleton instance
// export const tenantUtils = new TenantUtils();
