import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createFileRoute } from "@tanstack/react-router";
import Header from "@web/components/header";
import { Hosts } from "@web/lib/hosts";
import { Messages } from "@web/lib/messages";
import { Vms } from "@web/lib/vms";
export const Route = createFileRoute("/")({
    component: HomeComponent,
});
function HomeComponent() {
    return (_jsxs("div", { children: [_jsx(Header, {}), _jsxs("div", { className: "grid grid-cols-3 gap-10 p-10", children: [_jsx(Hosts, {}), _jsx(Messages, {}), _jsx(Vms, {})] })] }));
}
