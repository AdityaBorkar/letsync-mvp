import type { MutationBuilder } from "./mutation.js";

type MutationMap = Record<string, MutationBuilder<any, any>>;

export class MutationList<T extends MutationMap = MutationMap> {
	private readonly _mutations: T;

	constructor(mutations: T) {
		this._mutations = Object.freeze({ ...mutations });
	}

	get<K extends keyof T>(name: K): T[K] | undefined {
		return this._mutations[name];
	}

	getHandler<K extends keyof T>(name: K): T[K] | undefined {
		return this.get(name);
	}

	has(name: keyof T): boolean {
		return name in this._mutations;
	}

	get names(): Array<keyof T> {
		return Object.keys(this._mutations);
	}

	get size(): number {
		return Object.keys(this._mutations).length;
	}

	[Symbol.iterator](): Iterator<[keyof T, T[keyof T]]> {
		const entries = Object.entries(this._mutations) as [keyof T, T[keyof T]][];
		let index = 0;

		return {
			next(): IteratorResult<[keyof T, T[keyof T]]> {
				if (index < entries.length) {
					const entry = entries[index++];
					return { done: false, value: entry };
				}
				return { done: true, value: undefined };
			},
		};
	}
}
