import { existsSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { file } from "bun";

import { performDrizzleGenerate } from "./utils/drizzle.js";
import { JOURNAL_VERSION } from "./utils/letsync.js";

type SupportedSchemas = "drizzle-postgres";

interface GenerateOptions {
	schema: SupportedSchemas;
	output: string;
	dryRun?: boolean;
}

export async function generate(options: GenerateOptions) {
	console.log("🔄 Generating schema...");

	const schemaPath = join(process.cwd(), options.output);
	await copyFile(`../schemas/${options.schema}`, schemaPath);
	console.log(`   Copied file: ${schemaPath}`);

	const DryRun = options.dryRun;
	if (DryRun) {
		console.log("   Mode: Dry run (no files will be created)");
	}

	const { dialect, content, migration, config } =
		await performDrizzleGenerate();

	const path = join(process.cwd(), config.out, "../migrations-client/");
	if (!existsSync(path)) {
		await mkdir(path, { recursive: true });
	}

	const journal = file(join(path, "_journal.json"));
	const exists = await journal.exists();
	const DefaultJournal = { dialect, entries: [], version: JOURNAL_VERSION };
	if (!exists) {
		console.log("   Creating journal file...");
		const content = JSON.stringify(DefaultJournal, null, 2);
		if (DryRun) {
			console.log(`\n\n\n Write to file: ${journal.name} \n`);
			console.log(content);
		} else {
			await journal.write(content);
		}
	}
	const journalData = exists ? await journal.json() : DefaultJournal;
	// TODO: Validate journalData

	const journalEntry = {
		createdAt: Date.now().valueOf(),
		tag: migration.tag,
		version: JOURNAL_VERSION,
	};
	journalData.entries.push(journalEntry);
	const journalContent = JSON.stringify(journalData, null, 2);
	if (DryRun) {
		console.log(`\n\n\n Write to file: ${journal.name} \n`);
		console.log(journalContent);
	} else {
		await journal.write(journalContent);
	}

	// TODO: Implement DIRECTIVES later.
	// TODO: Implement Transformation later.

	const sqlFile = file(join(path, `${migration.tag}.sql`));
	if (DryRun) {
		console.log(`\n\n\n Write to file: ${sqlFile.name} \n`);
		console.log(content);
	} else {
		await sqlFile.write(content);
	}

	console.log("✅ Schema generation completed");
}
