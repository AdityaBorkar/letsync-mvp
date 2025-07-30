interface EnvConfig {
	name: string;
	description: string;
}

const ENVIRONMENTS: Record<string, EnvConfig> = {
	development: {
		description: "Local development environment",
		name: "Development",
	},
	production: {
		description: "Production environment",
		name: "Production",
	},
	staging: {
		description: "Staging environment for testing",
		name: "Staging",
	},
	testing: {
		description: "Testing environment",
		name: "Testing",
	},
};

export function detectEnv() {
	const nodeEnv = process.env.NODE_ENV?.toLowerCase();
	if (nodeEnv && ENVIRONMENTS[nodeEnv]) {
		return ENVIRONMENTS[nodeEnv];
	}
	return ENVIRONMENTS.development;
}
