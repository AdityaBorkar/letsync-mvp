import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { $ } from "bun";

import type { Options, PostgresType } from "postgres";

export async function generateSchema() {
	console.log("🔄 Running drizzle generate...");
	await $`bunx drizzle-kit generate`;
	// TODO: Print Logs
	// TODO: Error Handling
	console.log("   Generated migrations");
}

interface DrizzleConfig {
	schema: string | string[];
	out: string;
	dialect: string;
	dbCredentials?: Options<Record<string, PostgresType<unknown>>>;
}

export async function getConfig() {
	const path = join(process.cwd(), "drizzle.config.ts");
	const { default: config } = await import(path);
	return config as DrizzleConfig;
}

interface MigrationJournal {
	version: string;
	dialect: string;
	entries: Array<{
		idx: number;
		version: string;
		when: number;
		tag: string;
		breakpoints: boolean;
	}>;
}

export async function getJournal(path: string) {
	const fullPath = join(process.cwd(), path, "meta/_journal.json");
	const content = await readFile(fullPath, "utf-8");
	const journal = JSON.parse(content) as MigrationJournal;
	// TODO: Arktype Validation
	return journal;
}

export async function getMigrationSchema(path: string, tag: string) {
	const fullPath = join(process.cwd(), path, `${tag}.sql`);
	const content = await readFile(fullPath, "utf-8");
	return content;
}

export async function performDrizzleGenerate() {
	await generateSchema(); // TODO: Implement DRY MODE
	const config = await getConfig();
	const journal = await getJournal(config.out);
	console.log("📄 Processing Migration");
	console.log(`   Dialect: ${journal.dialect}`);

	const migration = journal.entries.at(-1);
	if (!migration) {
		throw new Error("No migrations found");
	}
	console.log(`   Latest migration: ${migration.tag}`);
	const content = await getMigrationSchema(config.out, migration.tag);

	return { config, content, dialect: journal.dialect, migration };
}
