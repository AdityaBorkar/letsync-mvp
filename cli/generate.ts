import { copyFileSync, existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { JOURNAL_VERSION } from "##letsync/cli/utils/letsync";
import { performDrizzleGenerate } from "@/utils/drizzle";

type SupportedSchemas = "drizzle-postgres";

interface GenerateOptions {
	schemaId: SupportedSchemas;
	schemaDir: string;
	dryRun?: boolean;
}

export async function generate(options: GenerateOptions) {
	const DRY_RUN = options.dryRun;

	console.log("🔄 Generating schema...");
	if (DRY_RUN) console.log("   Mode: Dry run (no files will be created)");

	const { dialect, content, migration, config } =
		await performDrizzleGenerate();

	const path = join(process.cwd(), config.out, "../migrations-client/");
	if (!existsSync(path)) await mkdir(path, { recursive: true });

	const journal = Bun.file(join(path, "_journal.json"));
	const exists = await journal.exists();
	const DEFAULT_JOURNAL = { dialect, entries: [], version: JOURNAL_VERSION };
	if (!exists) {
		console.log("   Creating journal file...");
		const content = JSON.stringify(DEFAULT_JOURNAL, null, 2);
		if (DRY_RUN) {
			console.log(`\n\n\n Write to file: ${journal.name} \n`);
			console.log(content);
		} else {
			await journal.write(content);
		}
	}
	const journalData = exists ? await journal.json() : DEFAULT_JOURNAL;
	// TODO: Validate journalData

	const journalEntry = {
		createdAt: Date.now().valueOf(),
		tag: migration.tag,
		version: JOURNAL_VERSION,
	};
	journalData.entries.push(journalEntry);
	const journalContent = JSON.stringify(journalData, null, 2);
	if (DRY_RUN) {
		console.log(`\n\n\n Write to file: ${journal.name} \n`);
		console.log(journalContent);
	} else {
		await journal.write(journalContent);
	}

	// TODO: Implement DIRECTIVES later.
	// TODO: Implement Transformation later.

	const sqlFile = Bun.file(join(path, `${migration.tag}.sql`));
	if (DRY_RUN) {
		console.log(`\n\n\n Write to file: ${sqlFile.name} \n`);
		console.log(content);
	} else {
		await sqlFile.write(content);
	}

	const schemaId = options.schemaId;
	const schemaDir = join(process.cwd(), options.schemaDir);
	const schemaPath = join(schemaDir, `${schemaId}.generated.ts`);
	copyFileSync(`../schemas/${schemaId}.txt`, schemaPath);
	console.log(`   Copied file: ${schemaPath}`);

	console.log("✅ Schema generation completed");
}
