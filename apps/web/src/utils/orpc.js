import { createORPCClient } from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { createORPCReactQueryUtils } from "@orpc/react-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import contract from "@web/utils/contract.json";
import { createContext, use } from "react";
import { toast } from "sonner";
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchInterval: 1000,
            retry: false,
        },
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
// biome-ignore lint/suspicious/noExplicitAny: contract type mismatch
export const link = new OpenAPILink(contract, {
    url: `${import.meta.env.VITE_SERVER_URL}/api`,
});
export const client = createORPCClient(link);
export const orpc = createORPCReactQueryUtils(client);
export const ORPCContext = createContext(undefined);
export function useORPC() {
    const orpc = use(ORPCContext);
    if (!orpc) {
        throw new Error("ORPCContext is not set up properly");
    }
    return orpc;
}
