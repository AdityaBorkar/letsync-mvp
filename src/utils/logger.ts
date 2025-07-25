// TODO: Make coloring compatible with server-side

export class Logger {
	private readonly prefix: string;
	private readonly color: string;

	constructor(prefix: string, color: null | string = null) {
		this.prefix = prefix;
		this.color = color ?? "#fff";
	}

	warn(title: string, ...messages: unknown[]) {
		console.warn(...this.render(title, ...messages));
	}

	error(title: string, ...messages: unknown[]) {
		console.error(...this.render(title, ...messages));
	}

	log(title: string, ...messages: unknown[]) {
		console.log(...this.render(title, ...messages));
	}

	private render(...msgs: unknown[]) {
		return [
			`%c[${this.prefix}]`,
			`background-color: ${this.color}; color: #000;`,
			...msgs,
		];
	}
}
