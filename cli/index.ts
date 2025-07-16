import { Command } from 'commander';

import { generate } from '##letsync/cli/generate';
import { migrate } from '##letsync/cli/migrate';
import { detectEnvironment } from '##letsync/cli/utils/detectEnv';

const program = new Command();

program
	.name('letsync')
	.description('LetSync - Schema Propagation Tool')
	.version('1.0.0')
	.hook('preAction', () => {
		const env = detectEnvironment();
		console.log('🔧 LetSync - Schema Propagation Tool');
		console.log(
			`📍 Environment: ${env.name.toUpperCase()} (${env.description})`,
		);
		console.log('');
	});

program
	.command('generate')
	.description('Generate a schema for use in a client')
	.option('--dry-run', 'Show what would be generated without creating files')
	.action(generate);

program
	.command('migrate')
	.description('Migrate schema changes to the database')
	.option('--dry-run', 'Show what would be generated without creating files')
	.action(migrate);

program.on('command:*', () => {
	console.error(
		'Invalid command: %s\nSee --help for a list of available commands.',
		program.args.join(' '),
	);
	process.exit(1);
});

program.parse();
