import { drizzleGenerate } from "./orm/drizzle/generate.js";
import { detectOrm } from "./utils/detect-orm.js";

interface GenerateOptions {
	// config?: string;
	dryRun?: boolean;
}

export async function generate(options: GenerateOptions) {
	const { dryRun = false } = options;

	console.log("Detecting ORM...");
	const orm = await detectOrm();
	if (!orm) {
		throw new Error("No ORM detected");
	}
	console.log(`   Detected ORM: ${orm.name} (${orm.path})`);

	if (orm.name === "drizzle") {
		await drizzleGenerate(orm.config, { dryRun });
	} else {
		throw new Error(
			"Failed to integrate with ORM. Kindly raise an GitHub issue.",
		);
	}
}
