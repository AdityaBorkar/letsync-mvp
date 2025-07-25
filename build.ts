// ? DEPRECATED IN FAVOR OF `zshy`

// import { $, build } from "bun";
// import { rm } from "fs/promises";

// await rm("dist", { force: true, recursive: true });

// const output = await build({
// 	entrypoints: [
// 		"src/index.ts",
// 		"./src/cli/index.ts",
// 		"./src/(frameworks)/next/index.ts",
// 		"./src/(frameworks)/react/index.ts",
// 		"./src/server/index.ts",
// 		// "src/server/index.ts",
// 		// "src/client/index.ts",
// 		// "src/default/config.ts",
// 		// "src/default/register-client-db.ts",
// 		// "src/default/register-pubsub.ts",
// 		// "src/default/register-server-db.ts",
// 	],
// 	external: ["react", "react-dom"],
// 	outdir: "dist",
// 	target: "bun",
// });

// const types =
// 	await $`tsc --outDir dist/src --emitDeclarationOnly --emitDeclarationOnly --declaration`;

// console.log("Build complete status: ", output.success);
// console.log("Types complete status: ", types.text());
