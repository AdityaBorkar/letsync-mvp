// import type { MutationMessage } from "./engine.js";

// export interface ValidationResult {
// 	isValid: boolean;
// 	error?: string;
// 	warnings?: string[];
// }

// export interface ValidationRule {
// 	name: string;
// 	validate: (
// 		tenantId: string,
// 		mutation: MutationMessage,
// 	) => Promise<ValidationResult> | ValidationResult;
// }

// export interface TableSchema {
// 	name: string;
// 	fields: Record<string, FieldSchema>;
// 	constraints?: TableConstraints;
// }

// export interface FieldSchema {
// 	type: "string" | "number" | "boolean" | "date" | "uuid" | "json";
// 	required?: boolean;
// 	maxLength?: number;
// 	minLength?: number;
// 	pattern?: RegExp;
// 	enum?: string[];
// 	nullable?: boolean;
// }

// export interface TableConstraints {
// 	unique?: string[][];
// 	foreignKeys?: ForeignKeyConstraint[];
// 	checks?: CheckConstraint[];
// }

// export interface ForeignKeyConstraint {
// 	fields: string[];
// 	referencedTable: string;
// 	referencedFields: string[];
// }

// export interface CheckConstraint {
// 	name: string;
// 	expression: string;
// }

// /**
//  * Incoming mutation validation pipeline with schema validation
//  * Validates mutations against defined schemas and business rules
//  */
// export class MutationValidator {
// 	private validationRules: ValidationRule[] = [];
// 	private tableSchemas: Map<string, TableSchema> = new Map();

// 	constructor() {
// 		this.initializeDefaultRules();
// 		this.initializeDefaultSchemas();
// 	}

// 	/**
// 	 * Validate a mutation against all registered rules and schemas
// 	 */
// 	async validateMutation(
// 		tenantId: string,
// 		mutation: MutationMessage,
// 	): Promise<ValidationResult> {
// 		try {
// 			const warnings: string[] = [];

// 			// Basic validation
// 			const basicValidation = this.validateBasicStructure(mutation);
// 			if (!basicValidation.isValid) {
// 				return basicValidation;
// 			}

// 			// Schema validation
// 			const schemaValidation = await this.validateAgainstSchema(
// 				tenantId,
// 				mutation,
// 			);
// 			if (!schemaValidation.isValid) {
// 				return schemaValidation;
// 			}
// 			if (schemaValidation.warnings) {
// 				warnings.push(...schemaValidation.warnings);
// 			}

// 			// Run custom validation rules
// 			for (const rule of this.validationRules) {
// 				const result = await Promise.resolve(rule.validate(tenantId, mutation));
// 				if (!result.isValid) {
// 					return {
// 						error: `Validation rule '${rule.name}' failed: ${result.error}`,
// 						isValid: false,
// 					};
// 				}
// 				if (result.warnings) {
// 					warnings.push(...result.warnings);
// 				}
// 			}

// 			return {
// 				isValid: true,
// 				warnings: warnings.length > 0 ? warnings : undefined,
// 			};
// 		} catch (error) {
// 			return {
// 				error: `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
// 				isValid: false,
// 			};
// 		}
// 	}

// 	/**
// 	 * Register a custom validation rule
// 	 */
// 	addValidationRule(rule: ValidationRule): void {
// 		this.validationRules.push(rule);
// 	}

// 	/**
// 	 * Register a table schema for validation
// 	 */
// 	registerTableSchema(schema: TableSchema): void {
// 		this.tableSchemas.set(schema.name, schema);
// 	}

// 	/**
// 	 * Get registered table schema
// 	 */
// 	getTableSchema(tableName: string): TableSchema | undefined {
// 		return this.tableSchemas.get(tableName);
// 	}

// 	/**
// 	 * Validate basic mutation structure
// 	 */
// 	private validateBasicStructure(mutation: MutationMessage): ValidationResult {
// 		// Check required fields
// 		if (!mutation.table) {
// 			return { error: "Missing table name", isValid: false };
// 		}

// 		if (!mutation.operation) {
// 			return { error: "Missing operation type", isValid: false };
// 		}

// 		if (!["insert", "update", "delete"].includes(mutation.operation)) {
// 			return {
// 				error: `Invalid operation: ${mutation.operation}`,
// 				isValid: false,
// 			};
// 		}

// 		if (!mutation.data || typeof mutation.data !== "object") {
// 			return { error: "Missing or invalid data object", isValid: false };
// 		}

// 		if (
// 			!mutation.client_timestamp ||
// 			typeof mutation.client_timestamp !== "number"
// 		) {
// 			return { error: "Missing or invalid client timestamp", isValid: false };
// 		}

// 		// Validate timestamp is reasonable (not too far in future/past)
// 		const now = Date.now();
// 		const timeDiff = Math.abs(now - mutation.client_timestamp);
// 		const maxTimeDiff = 24 * 60 * 60 * 1000; // 24 hours

// 		if (timeDiff > maxTimeDiff) {
// 			return {
// 				error: "Client timestamp too far from server time",
// 				isValid: false,
// 			};
// 		}

// 		return { isValid: true };
// 	}

// 	/**
// 	 * Validate mutation against registered table schema
// 	 */
// 	private async validateAgainstSchema(
// 		_tenantId: string,
// 		mutation: MutationMessage,
// 	): Promise<ValidationResult> {
// 		const schema = this.tableSchemas.get(mutation.table);
// 		if (!schema) {
// 			// No schema registered - allow but warn
// 			return {
// 				isValid: true,
// 				warnings: [`No schema registered for table: ${mutation.table}`],
// 			};
// 		}

// 		const warnings: string[] = [];

// 		// For delete operations, we only need the ID
// 		if (mutation.operation === "delete") {
// 			if (!mutation.data.id) {
// 				return { error: "Delete operation missing record ID", isValid: false };
// 			}
// 			return { isValid: true };
// 		}

// 		// Validate each field in the mutation data
// 		for (const [fieldName, fieldValue] of Object.entries(mutation.data)) {
// 			const fieldSchema = schema.fields[fieldName];

// 			if (!fieldSchema) {
// 				warnings.push(`Unknown field: ${fieldName}`);
// 				continue;
// 			}

// 			const fieldValidation = this.validateField(
// 				fieldName,
// 				fieldValue,
// 				fieldSchema,
// 			);

// 			if (!fieldValidation.isValid) {
// 				return fieldValidation;
// 			}

// 			if (fieldValidation.warnings) {
// 				warnings.push(...fieldValidation.warnings);
// 			}
// 		}

// 		// Check required fields for insert operations
// 		if (mutation.operation === "insert") {
// 			for (const [fieldName, fieldSchema] of Object.entries(schema.fields)) {
// 				if (fieldSchema.required && !(fieldName in mutation.data)) {
// 					return {
// 						error: `Required field missing: ${fieldName}`,
// 						isValid: false,
// 					};
// 				}
// 			}
// 		}

// 		return {
// 			isValid: true,
// 			warnings: warnings.length > 0 ? warnings : undefined,
// 		};
// 	}

// 	/**
// 	 * Validate individual field value against schema
// 	 */
// 	private validateField(
// 		fieldName: string,
// 		value: any,
// 		schema: FieldSchema,
// 	): ValidationResult {
// 		const warnings: string[] = [];

// 		// Handle null values
// 		if (value === null || value === undefined) {
// 			if (schema.required && !schema.nullable) {
// 				return {
// 					error: `Field ${fieldName} is required and cannot be null`,
// 					isValid: false,
// 				};
// 			}
// 			return { isValid: true };
// 		}

// 		// Type validation
// 		const typeValidation = this.validateFieldType(
// 			fieldName,
// 			value,
// 			schema.type,
// 		);
// 		if (!typeValidation.isValid) {
// 			return typeValidation;
// 		}

// 		// String-specific validations
// 		if (schema.type === "string" && typeof value === "string") {
// 			if (schema.maxLength && value.length > schema.maxLength) {
// 				return {
// 					error: `Field ${fieldName} exceeds maximum length of ${schema.maxLength}`,
// 					isValid: false,
// 				};
// 			}

// 			if (schema.minLength && value.length < schema.minLength) {
// 				return {
// 					error: `Field ${fieldName} is shorter than minimum length of ${schema.minLength}`,
// 					isValid: false,
// 				};
// 			}

// 			if (schema.pattern && !schema.pattern.test(value)) {
// 				return {
// 					error: `Field ${fieldName} does not match required pattern`,
// 					isValid: false,
// 				};
// 			}

// 			if (schema.enum && !schema.enum.includes(value)) {
// 				return {
// 					error: `Field ${fieldName} must be one of: ${schema.enum.join(", ")}`,
// 					isValid: false,
// 				};
// 			}
// 		}

// 		return {
// 			isValid: true,
// 			warnings: warnings.length > 0 ? warnings : undefined,
// 		};
// 	}

// 	/**
// 	 * Validate field type
// 	 */
// 	private validateFieldType(
// 		fieldName: string,
// 		value: any,
// 		expectedType: FieldSchema["type"],
// 	): ValidationResult {
// 		switch (expectedType) {
// 			case "string":
// 				if (typeof value !== "string") {
// 					return {
// 						error: `Field ${fieldName} must be a string`,
// 						isValid: false,
// 					};
// 				}
// 				break;

// 			case "number":
// 				if (typeof value !== "number" || Number.isNaN(value)) {
// 					return {
// 						error: `Field ${fieldName} must be a valid number`,
// 						isValid: false,
// 					};
// 				}
// 				break;

// 			case "boolean":
// 				if (typeof value !== "boolean") {
// 					return {
// 						error: `Field ${fieldName} must be a boolean`,
// 						isValid: false,
// 					};
// 				}
// 				break;

// 			case "date": {
// 				const dateValue = new Date(value);
// 				if (Number.isNaN(dateValue.getTime())) {
// 					return {
// 						error: `Field ${fieldName} must be a valid date`,
// 						isValid: false,
// 					};
// 				}
// 				break;
// 			}

// 			case "uuid": {
// 				const uuidPattern =
// 					/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// 				if (typeof value !== "string" || !uuidPattern.test(value)) {
// 					return {
// 						error: `Field ${fieldName} must be a valid UUID`,
// 						isValid: false,
// 					};
// 				}
// 				break;
// 			}

// 			case "json":
// 				// JSON can be any valid JSON value
// 				try {
// 					JSON.stringify(value);
// 				} catch {
// 					return {
// 						error: `Field ${fieldName} must be valid JSON`,
// 						isValid: false,
// 					};
// 				}
// 				break;

// 			default:
// 				return {
// 					error: `Unknown field type: ${expectedType}`,
// 					isValid: false,
// 				};
// 		}

// 		return { isValid: true };
// 	}

// 	/**
// 	 * Initialize default validation rules
// 	 */
// 	private initializeDefaultRules(): void {
// 		// Anti-spam rule
// 		this.addValidationRule({
// 			name: "rate_limit",
// 			validate: async (_tenantId: string, _mutation: MutationMessage) => {
// 				// TODO: Implement rate limiting logic
// 				// This would check against a rate limit store (Redis, etc.)
// 				return { isValid: true };
// 			},
// 		});

// 		// Data size limit rule
// 		this.addValidationRule({
// 			name: "data_size_limit",
// 			validate: (_tenantId: string, mutation: MutationMessage) => {
// 				const dataStr = JSON.stringify(mutation.data);
// 				const maxSize = 1024 * 1024; // 1MB limit

// 				if (dataStr.length > maxSize) {
// 					return {
// 						error: `Mutation data exceeds maximum size of ${maxSize} bytes`,
// 						isValid: false,
// 					};
// 				}

// 				return { isValid: true };
// 			},
// 		});
// 	}

// 	/**
// 	 * Initialize default table schemas
// 	 * These will be expanded as the application grows
// 	 */
// 	private initializeDefaultSchemas(): void {
// 		// Example tenant schema
// 		this.registerTableSchema({
// 			fields: {
// 				created: { required: true, type: "date" },
// 				deleted: { nullable: true, type: "date" },
// 				id: { required: true, type: "uuid" },
// 				name: { maxLength: 255, type: "string" },
// 				updated: { required: true, type: "date" },
// 			},
// 			name: "tenants",
// 		});

// 		// TODO: Add more table schemas as they are defined
// 		// These should match the actual database schema
// 	}

// 	/**
// 	 * Health check for the mutation validator
// 	 */
// 	async healthCheck(): Promise<void> {
// 		try {
// 			// Test basic validation functionality
// 			const testMutation: MutationMessage = {
// 				client_timestamp: Date.now(),
// 				data: { test: "value" },
// 				operation: "insert",
// 				table: "test_table",
// 				type: "mutation",
// 			};

// 			const result = await this.validateMutation("test-tenant", testMutation);

// 			// Should be valid (no schema registered for test_table)
// 			if (!result.isValid) {
// 				throw new Error("Basic validation test failed");
// 			}

// 			console.log("Mutation validator health check passed");
// 		} catch (error) {
// 			console.error("Mutation validator health check failed:", error);
// 			throw new Error(
// 				`Mutation validator unhealthy: ${error instanceof Error ? error.message : "Unknown error"}`,
// 			);
// 		}
// 	}
// }

// // Export singleton instance
// export const mutationValidator = new MutationValidator();
