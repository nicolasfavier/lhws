import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@web/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@web/components/ui/select";
import { Input } from "@web/components/ui/input";
import { Button } from "@web/components/ui/button";
import { orpc, queryClient } from "@web/utils/orpc";
import { Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
const RIGHT_LEVELS = ["READ", "WRITE", "ADMIN"];
export function HostRightsModal({ host, open, onOpenChange, }) {
    const { data: users, refetch } = useQuery({
        ...orpc.hosts.users.list.queryOptions({ input: { id: host.id } }),
        enabled: open,
    });
    const [loading, setLoading] = useState(null);
    const [newEmail, setNewEmail] = useState("");
    const [newLevel, setNewLevel] = useState("READ");
    const [adding, setAdding] = useState(false);
    async function handleChangeLevel(userId, email, level) {
        setLoading(userId);
        await orpc.hosts.users.invite.call({
            id: host.id,
            email,
            level: level,
        });
        await refetch();
        queryClient.invalidateQueries();
        setLoading(null);
    }
    async function handleDelete(userId) {
        setLoading(userId);
        await orpc.hosts.users.delete.call({ id: host.id, userId });
        await refetch();
        queryClient.invalidateQueries();
        setLoading(null);
    }
    async function handleAdd() {
        if (!newEmail.trim())
            return;
        setAdding(true);
        await orpc.hosts.users.invite.call({
            id: host.id,
            email: newEmail.trim(),
            level: newLevel,
        });
        setNewEmail("");
        setNewLevel("READ");
        await refetch();
        queryClient.invalidateQueries();
        setAdding(false);
    }
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { children: ["Manage rights - ", host.name] }) }), _jsxs("div", { className: "space-y-3", children: [users?.length === 0 && (_jsx("p", { className: "text-muted-foreground text-sm", children: "No users assigned to this host." })), users?.map((user) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "min-w-0 flex-1 truncate text-sm", children: user.email }), _jsxs(Select, { value: user.level, onValueChange: (value) => handleChangeLevel(user.id, user.email, value), disabled: loading === user.id, children: [_jsx(SelectTrigger, { className: "w-28", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: RIGHT_LEVELS.map((level) => (_jsx(SelectItem, { value: level, children: level }, level))) })] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleDelete(user.id), disabled: loading === user.id || user.level === "ADMIN", children: _jsx(Trash2, { className: "size-4" }) })] }, user.id)))] }), _jsxs("div", { className: "flex items-center gap-3 border-t pt-3", children: [_jsx(Input, { placeholder: "user@example.com", type: "email", value: newEmail, onChange: (e) => setNewEmail(e.target.value), onKeyDown: (e) => e.key === "Enter" && handleAdd(), className: "min-w-0 flex-1" }), _jsxs(Select, { value: newLevel, onValueChange: (value) => setNewLevel(value), children: [_jsx(SelectTrigger, { className: "w-28", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: RIGHT_LEVELS.map((level) => (_jsx(SelectItem, { value: level, children: level }, level))) })] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: handleAdd, disabled: adding || !newEmail.trim(), children: _jsx(Plus, { className: "size-4" }) })] })] }) }));
}
