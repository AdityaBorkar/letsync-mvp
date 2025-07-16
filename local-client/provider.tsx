import { createContext } from "react";

type Config = {
	port: number;
};

export function LocalClientProvider({
	config,
	children,
}: {
	config: Config;
	children: React.ReactNode;
}) {
	return (
		<LocalClientContext.Provider value={config}>
			{children}
		</LocalClientContext.Provider>
	);
}

export const LocalClientContext = createContext<Config>({
	port: 5000,
});
