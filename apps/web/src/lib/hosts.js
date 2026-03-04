import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ServiceUnavailable, isServiceError, } from "@web/components/service-unavailable";
import { H1 } from "@web/components/typography";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@web/components/ui/dropdown-menu";
import { cn } from "@web/lib/utils";
import { HostRightsModal } from "@web/lib/host-rights-modal";
import { useDashboard } from "@web/utils/use-dashboard";
import { orpc, queryClient } from "@web/utils/orpc";
import { Power, RotateCw, Shield } from "lucide-react";
import { useState } from "react";
const STATUS_ORDER = [
    "ERROR",
    "OFF",
    "RUNNING",
    "STARTING",
];
export function Hosts() {
    const { data, error, isError } = useDashboard();
    const hosts = data?.hosts;
    const [rightsHost, setRightsHost] = useState(null);
    const [ref] = useAutoAnimate();
    const hostsByStatus = Object.groupBy(hosts ?? [], (host) => host.status);
    async function handleRestart(id) {
        await orpc.hosts.restart.call({ id });
        queryClient.invalidateQueries();
    }
    async function handleShutdown(id) {
        await orpc.hosts.shutdown.call({ id });
        queryClient.invalidateQueries();
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(H1, { children: "Hosts" }), isServiceError(error) ? (_jsx(ServiceUnavailable, {})) : (!isError && (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid grid-cols-2 justify-center gap-2", children: STATUS_ORDER.map((status) => {
                            const count = hostsByStatus[status]?.length ?? 0;
                            if (count === 0)
                                return null;
                            return (_jsxs("p", { className: cn("w-full rounded-full px-2 py-0.5 text-center font-medium text-sm", getClassName(status)), children: [count, " ", status] }, status));
                        }) }), _jsx("div", { className: "space-y-1", ref: ref, children: [...(hosts ?? [])].sort(sort).map((host) => (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs("div", { className: "flex cursor-pointer items-center gap-3 rounded-md px-2 py-1 hover:bg-accent", children: [_jsx("div", { className: cn("size-3 shrink-0 rounded-full", getDotClassName(host.status)) }), _jsx("span", { className: "text-sm", children: host.name }), host.rights.length > 0 && (_jsx("span", { className: "text-muted-foreground text-xs", children: host.rights
                                                    .map((r) => `${r.email} (${r.level})`)
                                                    .join(", ") })), _jsx("span", { className: cn("ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-medium", getClassName(host.status)), children: host.status })] }) }), _jsxs(DropdownMenuContent, { align: "start", children: [_jsxs(DropdownMenuItem, { onClick: () => setRightsHost(host), children: [_jsx(Shield, {}), "Manage rights"] }), _jsxs(DropdownMenuItem, { onClick: () => handleRestart(host.id), children: [_jsx(RotateCw, {}), "Restart"] }), _jsxs(DropdownMenuItem, { onClick: () => handleShutdown(host.id), children: [_jsx(Power, {}), "Shutdown"] })] })] }, host.id))) }), rightsHost && (_jsx(HostRightsModal, { host: rightsHost, open: !!rightsHost, onOpenChange: (open) => {
                            if (!open)
                                setRightsHost(null);
                        } }))] })))] }));
}
function getClassName(status) {
    if (status === "RUNNING")
        return "bg-green-300 text-green-800";
    if (status === "OFF")
        return "bg-gray-300 text-gray-800";
    if (status === "STARTING")
        return "bg-cyan-300 text-cyan-800";
    if (status === "ERROR")
        return "bg-red-300 text-red-800";
    return "";
}
function getDotClassName(status) {
    if (status === "RUNNING")
        return "bg-green-500";
    if (status === "OFF")
        return "bg-gray-400";
    if (status === "STARTING")
        return "bg-cyan-500";
    if (status === "ERROR")
        return "bg-red-500";
    return "";
}
function sort(host1, host2) {
    const sortOrder = ["ERROR", "STARTING", "RUNNING", "OFF"];
    return sortOrder.indexOf(host1.status) - sortOrder.indexOf(host2.status) || host1.name.localeCompare(host2.name);
}
