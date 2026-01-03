// ? DEPRECATED IN FAVOR OF `zshy`

// import { $, build } from "bun";
// import { rm } from "fs/promises";

// await rm("dist", { force: true, recursive: true });

// const output = await build({
// 	entrypoints: [
// 		"src/index.js",
// 		"./src/cli/index.js",
// 		"./src/(frameworks)/next/index.js",
// 		"./src/(frameworks)/react/index.js",
// 		"./src/server/index.js",
// 		// "src/server/index.js",
// 		// "src/client/index.js",
// 		// "src/default/config.js",
// 		// "src/default/register-client-db.js",
// 		// "src/default/register-pubsub.js",
// 		// "src/default/register-server-db.js",
// 	],
// 	external: ["react", "react-dom"],
// 	outdir: "dist",
// 	target: "bun",
// });

// const types =
// 	await $`tsc --outDir dist/src --emitDeclarationOnly --emitDeclarationOnly --declaration`;

// console.log("Build complete status: ", output.success);
// console.log("Types complete status: ", types.text());
