import { existsSync } from "node:fs";
import { join } from "node:path";

const FILE_EXTENSIONS = [".ts", ".js", ".cjs", ".mjs"];
const POSSIBLE_CONFIG_NAMES = [
	{ fileName: "./drizzle.config", name: "drizzle" },
];

export async function detectOrm() {
	const cwd = process.cwd();
	for (const { name, fileName } of POSSIBLE_CONFIG_NAMES) {
		for (const extension of FILE_EXTENSIONS) {
			const path = join(cwd, `${fileName}${extension}`);
			if (existsSync(path)) {
				const { default: config } = await import(path);
				return { config, name, path };
			}
		}
	}
	return null;
}
