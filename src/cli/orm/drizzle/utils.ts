import { join } from "node:path";
import { file, write } from "bun";

import type { Config } from "./types.js";

export async function generateConfig(config: Config) {
	const paths = ["client", "server"] as const;
	const configs = new Map<"client" | "server", Config>();
	for await (const path of paths) {
		const $config = { ...config };
		$config.out = join(config.out, `/${path}`);
		$config.schema = join($config.out, config.schema);

		const content = `import { defineConfig } from "drizzle-kit";\n\nexport default defineConfig(${JSON.stringify($config, null, 2)});`;
		const configPath = join(process.cwd(), $config.out, "config.ts");
		await write(configPath, content);
		configs.set(path, $config);
	}
	return configs;
}

export async function getJournal(outPath: string) {
	const journalPath = join(outPath, "/meta/_journal.json");
	const journal = await file(journalPath).json();
	return journal;
}
