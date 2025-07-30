import { createHash } from "node:crypto";
import { $ } from "bun";

import type { Config } from "./types.js";
import { generateConfig } from "./utils.js";

export async function drizzlePush(
	config: Config,
	_options: { dryRun: boolean },
) {
	// const { dryRun = false } = options;

	await generateConfig(config, ["/client", "/server"]);

	console.log("🔄 Pushing Schema for [SERVER]...");
	await $`bunx drizzle-kit push --config=${config.out}/config.ts`;

	console.log("🔄 Pushing Schema for [CLIENT]...");
	// TODO: PUSH TO DATABASE in `client_schemas` table. Later rename it to `__client_schemas`
	const snapshot = {};

	// Generate checksum of the snapshot content
	console.log("Generating schema checksum...");
	const snapshotString = JSON.stringify(snapshot, null, 2);
	const checksum = createHash("sha256").update(snapshotString).digest("hex");
	console.log(`Generated checksum: ${checksum}`);

	console.log("✅ Schema push completed");
	return;
}

// 		// Check if this version already exists
// 		log.progress("Checking for existing schema version...");
// 		const existingRecord = await db
// 			.select()
// 			.from(clientSchemas)
// 			.where(eq(clientSchemas.version, version))
// 			.limit(1);

// 		if (existingRecord.length > 0) {
// 			log.warning(
// 				`Schema version ${colors.bright}${version}${colors.reset} already exists in database`,
// 			);
// 			console.log(
// 				`   ${colors.dim}Existing checksum: ${existingRecord[0].checksum.substring(0, 8)}...${colors.reset}`,
// 			);
// 			console.log(
// 				`   ${colors.dim}New checksum:      ${checksum.substring(0, 8)}...${colors.reset}`,
// 			);

// 			if (existingRecord[0].checksum === checksum) {
// 				log.success("Schema is already up to date - no changes needed");
// 				const endTime = Date.now();
// 				log.info(
// 					`Completed in ${colors.bright}${endTime - startTime}ms${colors.reset}`,
// 				);
// 				return;
// 			}

// 			log.progress("Updating existing record with new schema...");

// 			// Update existing record
// 			try {
// 				await db
// 					.update(clientSchemas)
// 					.set({
// 						checksum,
// 						createdAt: new Date(),
// 						isRolledBack: false,
// 						snapshot: snapshotString,
// 						sql: sqlContent,
// 						tag,
// 					})
// 					.where(eq(clientSchemas.version, version));

// 				log.success(
// 					`Schema record updated successfully for version ${colors.bright}${version}${colors.reset}`,
// 				);
// 			} catch (error) {
// 				throw new Error(`Failed to update schema record: ${error}`);
// 			}
// 		} else {
// 			log.progress("Inserting new schema record...");

// 			// Insert new record
// 			try {
// 				await db.insert(clientSchemas).values({
// 					checksum,
// 					createdAt: new Date(),
// 					isRolledBack: false,
// 					snapshot: snapshotString,
// 					sql: sqlContent,
// 					tag,
// 					version: Number(version),
// 				});

// 				log.success(
// 					`Schema record inserted successfully for version ${colors.bright}${version}${colors.reset}`,
// 				);
// 			} catch (error) {
// 				throw new Error(`Failed to insert schema record: ${error}`);
// 			}
// 		}

// 		const endTime = Date.now();
// 		log.success(
// 			`🎉 Schema push completed for version ${colors.bright}${version}${colors.reset}`,
// 		);
// 		log.info(
// 			`Total execution time: ${colors.bright}${endTime - startTime}ms${colors.reset}`,
// 		);
// 		process.exit(0);
// 	} catch (error) {
// 		log.error("Schema push failed", error);
// 		process.exit(1);
// 	}
// }
