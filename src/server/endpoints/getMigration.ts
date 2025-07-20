import type { BunRequest } from "bun";

import { ArkErrors, type } from "arktype";

import type { LetSyncContext } from "@/types/context.js";
import type { ServerDB } from "@/types/index.js";

// TODO: Cache Requests for 365 days, if returns 200 (ISR)
// TODO: Cache Requests for 24 hrs, if returns 404 (ISR)

// ! WORK ON THIS ENTIRE API ENDPOINT

const schema = type({
	from: "number",
	name: "string",
	"to?": "number",
});

export async function getMigration(
	request: BunRequest,
	context: LetSyncContext<Request>,
) {
	try {
		// Request Validation
		const { searchParams } = new URL(request.url);
		const data = schema({
			from: searchParams.get("from")
				? Number.parseInt(searchParams.get("from") ?? "0")
				: null,
			name: searchParams.get("name"),
			to: searchParams.get("to")
				? Number.parseInt(searchParams.get("to") ?? "0")
				: null,
		});

		if (data instanceof ArkErrors) {
			return Response.json({ error: data.summary }, { status: 400 });
		}

		const { from, name, to } = data;

		// Validation: from and to cannot be the same
		if (from === to) {
			const error = "from and to cannot be the same";
			return Response.json({ error }, { status: 400 });
		}

		// Validation: from must be older than to
		if (to && from > to) {
			const error = "from must be older than to";
			return Response.json({ error }, { status: 400 });
		}

		const serverDb = context.db.get("postgres"); // ! REPLACE HARDCODED DB NAME
		if (!serverDb) {
			throw new Error("Server database not found");
		}

		// Generate migration SQL
		const result = await generateMigrationSql(serverDb.db, from, to, name);

		if (!result) {
			return Response.json(
				{
					error: "No migration found or migration already up to date",
				},
				{ status: 404 },
			);
		}

		return Response.json({
			fromVersion: from,
			migrations: result.migrations,
			name: name,
			sql: result.sql,
			timestamp: new Date().toISOString(),
			toVersion: result.toVersion,
		});
	} catch (error) {
		console.error("Error in getMigration:", error);
		return Response.json(
			{
				error: "Internal server error",
			},
			{ status: 500 },
		);
	}
}

interface MigrationResult {
	sql: string;
	toVersion: number;
	migrations: Array<{
		version: string;
		tag: string | null;
		createdAt: Date;
		checksum: string;
	}>;
}

async function generateMigrationSql(
	db: ServerDB.Adapter<unknown>["db"],
	fromVersion: number,
	toVersion?: number | null,
	name?: string | null,
): Promise<MigrationResult | null> {
	try {
		// If toVersion is not provided, get the latest version
		let targetVersion = toVersion;
		if (!targetVersion) {
			// @ts-expect-error FIX THIS
			const latestSchema = await db.sql`
			SELECT version FROM client_schemas
			WHERE version IS NOT NULL AND sql IS NOT NULL
			ORDER BY version DESC
			LIMIT 1;
			`
				// @ts-expect-error FIX THIS
				.then((res) => res.rows[0]);

			if (latestSchema.length === 0) {
				throw new Error("No schemas found in database");
			}

			targetVersion = Number.parseInt(latestSchema[0].version);
		}

		// Validate fromVersion exists and is valid
		if (fromVersion >= targetVersion) {
			return null; // No migration needed
		}

		// Get all schema versions between fromVersion and targetVersion (inclusive)
		// @ts-expect-error FIX THIS
		const versions = await db.sql`
		SELECT
			checksum,
			createdAt,
			isRolledBack,
			sql,
			tag,
			version
		FROM client_schemas
		WHERE version >= ${fromVersion + 1} AND version <= ${targetVersion} AND sql IS NOT NULL
		ORDER BY version;
		`.execute();

		if (versions.length === 0) {
			return null; // No migrations found in range
		}

		// Filter out rolled back migrations
		const validMigrations = versions.filter(
			(v: { isRolledBack: boolean }) => !v.isRolledBack,
		);

		if (validMigrations.length === 0) {
			return null; // All migrations in range are rolled back
		}

		// Build combined migration SQL
		const migrationSqls: string[] = [];
		const migrationInfo: MigrationResult["migrations"] = [];

		for (const migration of validMigrations) {
			// Add migration info for response
			migrationInfo.push({
				checksum: migration.checksum,
				createdAt: migration.createdAt,
				tag: migration.tag,
				version: migration.version,
			});

			// Add SQL with descriptive comment
			const comment = migration.tag
				? `-- Migration to version ${migration.version}: ${migration.tag}`
				: `-- Migration to version ${migration.version}`;

			migrationSqls.push(`${comment}\n${migration.sql.trim()}`);
		}

		if (migrationSqls.length === 0) {
			return null;
		}

		// Combine all migrations with proper separation
		const combinedSql = migrationSqls.join("\n\n");

		// Add header comment with migration range info
		const headerComment = name
			? `-- Migration for ${name}: versions ${fromVersion} → ${targetVersion}`
			: `-- Migration from version ${fromVersion} to ${targetVersion}`;

		const finalSql = `${headerComment}\n-- Generated at: ${new Date().toISOString()}\n\n${combinedSql}`;

		return {
			migrations: migrationInfo,
			sql: finalSql,
			toVersion: targetVersion,
		};
	} catch (error) {
		console.error("Error generating migration SQL:", error);
		throw error;
	}
}
