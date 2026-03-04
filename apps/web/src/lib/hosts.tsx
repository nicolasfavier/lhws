import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
	ServiceUnavailable,
	isServiceError,
} from "@web/components/service-unavailable";
import { H1 } from "@web/components/typography";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@web/components/ui/dropdown-menu";
import { cn } from "@web/lib/utils";
import { HostRightsModal } from "@web/lib/host-rights-modal";
import { useDashboard } from "@web/utils/use-dashboard";
import type { Inputs } from "@web/utils/orpc";
import { orpc, queryClient } from "@web/utils/orpc";
import { Power, RotateCw, Shield } from "lucide-react";
import { useState } from "react";

const STATUS_ORDER: Inputs["web"]["dashboard"]["hosts"][number]["status"][] = [
	"ERROR",
	"OFF",
	"RUNNING",
	"STARTING",
];

type Host = Inputs["web"]["dashboard"]["hosts"][number];

export function Hosts() {
	const { data, error, isError } = useDashboard();
	const hosts = data?.hosts;
	const [rightsHost, setRightsHost] = useState<Host | null>(null);

	const [ref] = useAutoAnimate();

	const hostsByStatus = Object.groupBy(
		hosts ?? [],
		(host) => host.status,
	);

	async function handleRestart(id: string) {
		await orpc.hosts.restart.call({ id });
		queryClient.invalidateQueries();
	}

	async function handleShutdown(id: string) {
		await orpc.hosts.shutdown.call({ id });
		queryClient.invalidateQueries();
	}

	return (
		<div className="space-y-6">
			<H1>Hosts</H1>
			{isServiceError(error) ? (
				<ServiceUnavailable />
			) : (
				!isError && (
					<>
						<div className="grid grid-cols-2 justify-center gap-2">
							{STATUS_ORDER.map((status) => {
								const count = hostsByStatus[status]?.length ?? 0;
								if (count === 0) return null;
								return (
									<p
										key={status}
										className={cn(
											"w-full rounded-full px-2 py-0.5 text-center font-medium text-sm",
											getClassName(status),
										)}
									>
										{count} {status}
									</p>
								);
							})}
						</div>
						<div className="space-y-1" ref={ref}>
							{[...(hosts ?? [])].sort(sort).map((host) => (
								<DropdownMenu key={host.id}>
									<DropdownMenuTrigger asChild>
										<div
											className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1 hover:bg-accent"
										>
											<div
												className={cn(
													"size-3 shrink-0 rounded-full",
													getDotClassName(host.status),
												)}
											/>
											<span className="text-sm">{host.name}</span>
											{host.rights.length > 0 && (
												<span className="text-muted-foreground text-xs">
													{host.rights
														.map((r) => `${r.email} (${r.level})`)
														.join(", ")}
												</span>
											)}
											<span
												className={cn(
													"ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
													getClassName(host.status),
												)}
											>
												{host.status}
											</span>
										</div>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="start">
										<DropdownMenuItem onClick={() => setRightsHost(host)}>
											<Shield />
											Manage rights
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => handleRestart(host.id)}>
											<RotateCw />
											Restart
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => handleShutdown(host.id)}>
											<Power />
											Shutdown
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							))}
						</div>
						{rightsHost && (
							<HostRightsModal
								host={rightsHost}
								open={!!rightsHost}
								onOpenChange={(open) => {
									if (!open) setRightsHost(null);
								}}
							/>
						)}
					</>
				)
			)}
		</div>
	);
}

function getClassName(status: Host["status"]) {
	if (status === "RUNNING") return "bg-green-300 text-green-800";
	if (status === "OFF") return "bg-gray-300 text-gray-800";
	if (status === "STARTING") return "bg-cyan-300 text-cyan-800";
	if (status === "ERROR") return "bg-red-300 text-red-800";
	return "";
}

function getDotClassName(status: Host["status"]) {
	if (status === "RUNNING") return "bg-green-500";
	if (status === "OFF") return "bg-gray-400";
	if (status === "STARTING") return "bg-cyan-500";
	if (status === "ERROR") return "bg-red-500";
	return "";
}

function sort(host1: Host, host2: Host) {
	const sortOrder = ["ERROR", "STARTING", "RUNNING", "OFF"];
	return sortOrder.indexOf(host1.status) - sortOrder.indexOf(host2.status) || host1.name.localeCompare(host2.name);
}
