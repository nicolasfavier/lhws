import { createORPCClient } from "@orpc/client";
import { createORPCReactQueryUtils } from "@orpc/react-query";
import type { RouterClient } from "@orpc/server";
import type { appRouter } from "@server/routers";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Loader from "@web/components/loader";
import { ThemeProvider } from "@web/components/theme-provider";
import { Toaster } from "@web/components/ui/sonner";
import { link, ORPCContext, type orpc } from "@web/utils/orpc";
import { useState } from "react";
import "../index.css";

export interface RouterAppContext {
	orpc: typeof orpc;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "TakiWS Control Center",
			},
			{
				name: "description",
				content: "This is the main control center for TakiWS.",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});

function RootComponent() {
	const isFetching = useRouterState({
		select: (s) => s.isLoading,
	});

	const [client] = useState<RouterClient<typeof appRouter>>(() =>
		createORPCClient(link),
	);
	const [orpcUtils] = useState(() => createORPCReactQueryUtils(client));

	return (
		<>
			<HeadContent />
			<ORPCContext.Provider value={orpcUtils}>
				<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
					<div className="grid h-svh grid-rows-[auto_1fr]">
						{/*<Header />*/}
						{isFetching ? <Loader /> : <Outlet />}
					</div>
					<Toaster richColors />
				</ThemeProvider>
			</ORPCContext.Provider>
			<TanStackRouterDevtools position="bottom-left" />
			<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
		</>
	);
}
