import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ServiceUnavailable, isServiceError, } from "@web/components/service-unavailable";
import { H1 } from "@web/components/typography";
import { Progress } from "@web/components/ui/progress";
import { useDashboard } from "@web/utils/use-dashboard";
function getHostName(vmName) {
    const last = vmName.lastIndexOf("-");
    return last > 0 ? vmName.slice(0, last) : vmName;
}
export function Vms() {
    const { data, error, isError } = useDashboard();
    const vms = data?.vms;
    const [ref] = useAutoAnimate();
    const grouped = Object.entries(Object.groupBy(vms ?? [], (vm) => getHostName(vm.name))).sort(([a], [b]) => a.localeCompare(b));
    return (_jsxs("div", { children: [_jsx(H1, { children: "Virtual Machines" }), isServiceError(error) ? (_jsx(ServiceUnavailable, {})) : (!isError && (_jsx("div", { className: "space-y-6", ref: ref, children: grouped.map(([host, vms]) => (_jsxs("div", { children: [_jsx("h3", { className: "mb-2 font-semibold text-sm capitalize", children: host }), _jsxs("div", { className: "mb-1 grid grid-cols-[auto_auto_1fr_auto_1fr] gap-x-2 gap-y-1 text-muted-foreground text-xs", children: [_jsx("p", { children: "Name" }), _jsx("p", {}), _jsx("p", { children: "CPU" }), _jsx("p", {}), _jsx("p", { children: "RAM" })] }), _jsx("div", { className: "space-y-2", children: vms
                                ?.sort((a, b) => a.name.localeCompare(b.name))
                                .map((vm) => (_jsxs("div", { className: "grid grid-cols-[auto_auto_1fr_auto_1fr] items-center gap-x-2 gap-y-1", children: [_jsx("p", { className: "row-span-2 text-sm", children: vm.name }), _jsx("span", { className: "text-muted-foreground text-xs", children: "AVG" }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Progress, { value: vm.cpuAvgPercent, className: "flex-1" }), _jsxs("span", { className: "w-8 text-right text-muted-foreground text-xs", children: [vm.cpuAvgPercent, "%"] })] }), _jsx("span", { className: "text-muted-foreground text-xs", children: "AVG" }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Progress, { value: vm.ramAvgPercent, className: "flex-1" }), _jsxs("span", { className: "w-8 text-right text-muted-foreground text-xs", children: [vm.ramAvgPercent, "%"] })] }), _jsx("span", { className: "text-muted-foreground text-xs", children: "PEAK" }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Progress, { value: vm.cpuPeakPercent, className: "flex-1" }), _jsxs("span", { className: "w-8 text-right text-muted-foreground text-xs", children: [vm.cpuPeakPercent, "%"] })] }), _jsx("span", { className: "text-muted-foreground text-xs", children: "PEAK" }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Progress, { value: vm.ramPeakPercent, className: "flex-1" }), _jsxs("span", { className: "w-8 text-right text-muted-foreground text-xs", children: [vm.ramPeakPercent, "%"] })] })] }, vm.id))) })] }, host))) })))] }));
}
