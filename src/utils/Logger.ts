export class Logger {
	private readonly prefix: string;

	constructor(prefix: string) {
		this.prefix = prefix;
	}

	warn(title: string, ...messages: unknown[]) {
		console.warn(`[${this.prefix}] ${title}`, ...messages);
	}

	error(title: string, ...messages: unknown[]) {
		console.error(`[${this.prefix}] ${title}`, ...messages);
	}

	log(title: string, ...messages: unknown[]) {
		console.log(`[${this.prefix}] ${title}`, ...messages);
	}
}
