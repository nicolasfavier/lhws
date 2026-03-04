import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TriangleAlert } from "lucide-react";
export function ServiceUnavailable() {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-destructive/50 bg-destructive/5 p-6 text-center", children: [_jsx(TriangleAlert, { className: "size-8 text-destructive" }), _jsx("p", { className: "font-semibold text-destructive text-sm", children: "Service Unavailable" }), _jsx("p", { className: "text-muted-foreground text-xs", children: "The server returned a 503 error. Please try again later." })] }));
}
export function isServiceError(error) {
    if (!error)
        return false;
    if (!("status" in error))
        return false;
    const status = error.status;
    return status === 503 || status === 500;
}
