import { createORPCClient } from "@orpc/client";
import type { InferContractRouterOutputs } from "@orpc/contract";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { createORPCReactQueryUtils } from "@orpc/react-query";
import type { RouterUtils } from "@orpc/react-query";
import type { RouterClient } from "@orpc/server";
import type { appRouter } from "@server/routers";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import contract from "@web/utils/contract.json";
import { createContext, use } from "react";
import { toast } from "sonner";

type ORPCReactUtils = RouterUtils<RouterClient<typeof appRouter>>;

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: { refetchInterval: 1000 },
	},
	queryCache: new QueryCache({
		onError: (error) => {
			toast.error(`Error: ${error.message}`, {
				action: {
					label: "retry",
					onClick: () => {
						queryClient.invalidateQueries();
					},
				},
			});
		},
	}),
});

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const link = new OpenAPILink(contract as any, {
	url: `${import.meta.env.VITE_SERVER_URL}/api`,
});

export const client: RouterClient<typeof appRouter> = createORPCClient(link);

export const orpc = createORPCReactQueryUtils(client);

export const ORPCContext = createContext<ORPCReactUtils | undefined>(undefined);

export function useORPC(): ORPCReactUtils {
	const orpc = use(ORPCContext);
	if (!orpc) {
		throw new Error("ORPCContext is not set up properly");
	}
	return orpc;
}

export type Inputs = InferContractRouterOutputs<typeof appRouter>;
