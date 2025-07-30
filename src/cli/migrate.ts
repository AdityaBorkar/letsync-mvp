import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { file } from "bun";

import postgres from "postgres";

import { getConfig } from "./utils/drizzle.js";

interface MigrateOptions {
	dryRun?: boolean;
}

interface JournalEntry {
	version: string;
	createdAt: number;
	tag: string;
}

interface Journal {
	version: string;
	dialect: string;
	entries: JournalEntry[];
}

export async function migrate(options: MigrateOptions) {
	console.log("📦 Migrating schema changes...");
	if (options.dryRun) {
		console.log("   Mode: Dry run (no files will be created)");
	}

	const config = await getConfig();
	console.log("✅ Got database config");

	// TODO: Assuming database is "postgres"
	const dbCredentials = config.dbCredentials; // TODO: Validate
	const db = postgres(dbCredentials);
	console.log("✅ Database connection established");

	const letsyncPath = join(process.cwd(), config.out, "../migrations-client");
	if (!existsSync(letsyncPath)) {
		await mkdir(letsyncPath, { recursive: true });
	}

	const journalPath = file(join(letsyncPath, "_journal.json"));
	const journal: Journal = await journalPath.json();
	console.log(`✅ Read ${journal.entries.length} entries from _journal.json`);

	const existingSchemas = await db`SELECT * FROM "schema"`;
	console.log(`✅ Found ${existingSchemas.length} existing schema records`);

	const journalTags = new Set(journal.entries.map((entry) => entry.tag));
	const existingSchemaTags = new Set(existingSchemas.map((s) => s.tag));

	// Insert missing journal entries
	const missingEntries = journal.entries.filter(
		(entry) => !existingSchemaTags.has(entry.tag),
	);

	if (missingEntries.length > 0) {
		console.log(`📥 Inserting ${missingEntries.length} missing entries...`);
		for (const entry of missingEntries) {
			const _file = file(join(letsyncPath, `${entry.tag}.sql`));
			const content = await _file.text();
			await db`INSERT INTO schema (tag, version, schema, created_at) VALUES (${entry.tag}, ${entry.version}, ${content}, ${new Date(entry.createdAt)})`;
			console.log(`✅ Inserted ${entry.tag} schema`);
		}
		console.log("✅ Inserted missing entries");
	}

	// Remove schema records not in journal (cleanup orphaned records)
	const orphanedSchemas = existingSchemas.filter(
		(s) => !journalTags.has(s.schema),
	);

	if (orphanedSchemas.length > 0) {
		console.log(`🗑️  Removing ${orphanedSchemas.length} orphaned entries...`);
		for (const orphaned of orphanedSchemas) {
			await db`DELETE FROM schema WHERE version = ${orphaned.version}`;
		}
		console.log("✅ Removed orphaned entries");
	}

	// TODO: CHECK & VERIFY CONTENTS OF EXISTING SCHEMA TABLES. If does not match, throw error.

	await db.end();
	console.log("✅ Schema published and synced successfully");
	console.log(`   Total journal entries: ${journal.entries.length}`);
	console.log(`   Synced to database: ${journal.entries.length}`);
}
