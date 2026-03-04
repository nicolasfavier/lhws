import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@web/components/ui/button";
import { Label } from "@web/components/ui/label";
import { Switch } from "@web/components/ui/switch";
import { useDashboard } from "@web/utils/use-dashboard";
import { orpc, queryClient } from "@web/utils/orpc";
import { RotateCw } from "lucide-react";
export function Status() {
    const { data } = useDashboard();
    const isAvailable = data?.availability?.status ?? true;
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Switch, { id: "availability", checked: isAvailable, disabled: !data, onCheckedChange: (checked) => orpc.up.update.call({ status: checked }) }), _jsx(Label, { htmlFor: "availability", className: "cursor-pointer text-sm text-black", children: "Kill Switch" })] }));
}
export function MaintenanceMode() {
    const { data } = useDashboard();
    const isMaintenance = data?.maintenance?.status ?? false;
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Switch, { id: "maintenance", checked: isMaintenance, disabled: !data, onCheckedChange: (checked) => orpc.maintenance.update.call({ status: checked }) }), _jsx(Label, { htmlFor: "maintenance", className: "cursor-pointer text-sm text-black", children: "Maintenance mode" })] }));
}
export function ResetState() {
    const [loading, setLoading] = useState(false);
    async function handleReset() {
        setLoading(true);
        await orpc.admin.reset.call({});
        queryClient.invalidateQueries();
        setLoading(false);
    }
    return (_jsxs(Button, { variant: "outline", size: "sm", onClick: handleReset, disabled: loading, className: "gap-2", children: [_jsx(RotateCw, { className: loading ? "animate-spin" : "" }), _jsx("span", { className: "text-sm text-black", children: "Reset" })] }));
}
