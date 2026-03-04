import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ServiceUnavailable, isServiceError, } from "@web/components/service-unavailable";
import { H1 } from "@web/components/typography";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@web/components/ui/card";
import { useDashboard } from "@web/utils/use-dashboard";
import { formatDistanceToNow } from "date-fns";
import Markdown from "react-markdown";
export function Messages() {
    const { data, error, isError } = useDashboard();
    const messages = data?.messages;
    const [ref] = useAutoAnimate();
    return (_jsxs("div", { children: [_jsx(H1, { children: "Messages" }), isServiceError(error) ? (_jsx(ServiceUnavailable, {})) : (_jsx("div", { className: "space-y-4", ref: ref, children: !isError &&
                    messages?.map((message) => (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { children: [_jsx("span", { className: "text-muted-foreground", children: "To: " }), message.recipient] }), _jsx(CardDescription, { children: formatDistanceToNow(message.createdAt, {
                                            addSuffix: true,
                                        }) })] }), _jsx(CardContent, { children: _jsx(Markdown, { children: message.content }) })] }, message.id))) }))] }));
}
