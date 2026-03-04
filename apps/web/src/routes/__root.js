import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { createORPCClient } from "@orpc/client";
import { createORPCReactQueryUtils } from "@orpc/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, HeadContent, Outlet, useRouterState, } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Loader from "@web/components/loader";
import { ThemeProvider } from "@web/components/theme-provider";
import { Toaster } from "@web/components/ui/sonner";
import { link, ORPCContext } from "@web/utils/orpc";
import { useState } from "react";
import "../index.css";
export const Route = createRootRouteWithContext()({
    component: RootComponent,
    head: () => ({
        meta: [
            {
                title: "My App",
            },
            {
                name: "description",
                content: "My App is a web application",
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
    const [client] = useState(() => createORPCClient(link));
    const [orpcUtils] = useState(() => createORPCReactQueryUtils(client));
    return (_jsxs(_Fragment, { children: [_jsx(HeadContent, {}), _jsx(ORPCContext.Provider, { value: orpcUtils, children: _jsxs(ThemeProvider, { defaultTheme: "dark", storageKey: "vite-ui-theme", children: [_jsx("div", { className: "grid h-svh grid-rows-[auto_1fr]", children: isFetching ? _jsx(Loader, {}) : _jsx(Outlet, {}) }), _jsx(Toaster, { richColors: true })] }) }), _jsx(TanStackRouterDevtools, { position: "bottom-left" }), _jsx(ReactQueryDevtools, { position: "bottom", buttonPosition: "bottom-right" })] }));
}
