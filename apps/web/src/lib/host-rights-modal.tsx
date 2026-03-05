import { useQuery } from "@tanstack/react-query";
import { Button } from "@web/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@web/components/ui/dialog";
import { Input } from "@web/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@web/components/ui/select";
import type { Inputs } from "@web/utils/orpc";
import { orpc, queryClient } from "@web/utils/orpc";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type Host = Inputs["web"]["dashboard"]["hosts"][number];

const RIGHT_LEVELS = ["READ", "WRITE", "ADMIN"] as const;

export function HostRightsModal({
	host,
	open,
	onOpenChange,
}: {
	host: Host;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { data: users, refetch } = useQuery({
		...orpc.hosts.users.list.queryOptions({ input: { id: host.id } }),
		enabled: open,
	});

	const [loading, setLoading] = useState<string | null>(null);
	const [newEmail, setNewEmail] = useState("");
	const [newLevel, setNewLevel] =
		useState<(typeof RIGHT_LEVELS)[number]>("READ");
	const [adding, setAdding] = useState(false);

	async function handleChangeLevel(
		userId: string,
		email: string,
		level: string,
	) {
		setLoading(userId);
		await orpc.hosts.users.invite.call({
			id: host.id,
			email,
			level: level as (typeof RIGHT_LEVELS)[number],
		});
		await refetch();
		queryClient.invalidateQueries();
		setLoading(null);
	}

	async function handleDelete(userId: string) {
		setLoading(userId);
		await orpc.hosts.users.delete.call({ id: host.id, userId });
		await refetch();
		queryClient.invalidateQueries();
		setLoading(null);
	}

	async function handleAdd() {
		if (!newEmail.trim()) return;
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

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Manage rights - {host.name}</DialogTitle>
				</DialogHeader>
				<div className="space-y-3">
					{users?.length === 0 && (
						<p className="text-muted-foreground text-sm">
							No users assigned to this host.
						</p>
					)}
					{users?.map((user) => (
						<div key={user.id} className="flex items-center gap-3">
							<span className="min-w-0 flex-1 truncate text-sm">
								{user.email}
							</span>
							<Select
								value={user.level}
								onValueChange={(value) =>
									handleChangeLevel(user.id, user.email, value)
								}
								disabled={loading === user.id}
							>
								<SelectTrigger className="w-28">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{RIGHT_LEVELS.map((level) => (
										<SelectItem key={level} value={level}>
											{level}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => handleDelete(user.id)}
								disabled={loading === user.id || user.level === "ADMIN"}
							>
								<Trash2 className="size-4" />
							</Button>
						</div>
					))}
				</div>
				<div className="flex items-center gap-3 border-t pt-3">
					<Input
						placeholder="user@example.com"
						type="email"
						value={newEmail}
						onChange={(e) => setNewEmail(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleAdd()}
						className="min-w-0 flex-1"
					/>
					<Select
						value={newLevel}
						onValueChange={(value) =>
							setNewLevel(value as (typeof RIGHT_LEVELS)[number])
						}
					>
						<SelectTrigger className="w-28">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{RIGHT_LEVELS.map((level) => (
								<SelectItem key={level} value={level}>
									{level}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleAdd}
						disabled={adding || !newEmail.trim()}
					>
						<Plus className="size-4" />
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
