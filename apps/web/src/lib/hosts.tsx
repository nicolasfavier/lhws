import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
	ServiceUnavailable,
	isServiceError,
} from "@web/components/service-unavailable";
import { H1 } from "@web/components/typography";
import { cn } from "@web/lib/utils";
import type { Inputs } from "@web/utils/orpc";
import { orpc } from "@web/utils/orpc";
import { useStableQuery } from "@web/utils/use-stable-query";

const STATUS_ORDER: Inputs["hosts"]["get"]["status"][] = [
	"ERROR",
	"OFF",
	"RUNNING",
	"STARTING",
];

export function Hosts() {
	const hosts = useStableQuery(orpc.hosts.list.queryOptions());

	const [ref] = useAutoAnimate();

	const hostsByStatus = Object.groupBy(
		hosts.data ?? [],
		(host) => host.status,
	);

	return (
		<div className="space-y-6">
			<H1>Hosts</H1>
			{isServiceError(hosts.error) ? (
				<ServiceUnavailable />
			) : (
				!hosts.isError && (
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
											getClassName(
												status as Inputs["hosts"]["get"]["status"],
											),
										)}
									>
										{count} {status}
									</p>
								);
							})}
						</div>
						<div className="space-y-1" ref={ref}>
							{hosts.data?.sort(sort).map((host) => (
								<div
									key={host.id}
									className="flex items-center gap-3 rounded-md px-2 py-1"
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
							))}
						</div>
					</>
				)
			)}
		</div>
	);
}

function getClassName(status: Inputs["hosts"]["get"]["status"]) {
	if (status === "RUNNING") return "bg-green-300 text-green-800";
	if (status === "OFF") return "bg-gray-300 text-gray-800";
	if (status === "STARTING") return "bg-cyan-300 text-cyan-800";
	if (status === "ERROR") return "bg-red-300 text-red-800";
	return "";
}

function getDotClassName(status: Inputs["hosts"]["get"]["status"]) {
	if (status === "RUNNING") return "bg-green-500";
	if (status === "OFF") return "bg-gray-400";
	if (status === "STARTING") return "bg-cyan-500";
	if (status === "ERROR") return "bg-red-500";
	return "";
}

function sort(host1: Inputs["hosts"]["get"], host2: Inputs["hosts"]["get"]) {
	const sortOrder = ["ERROR", "STARTING", "RUNNING", "OFF"];
	return sortOrder.indexOf(host1.status) - sortOrder.indexOf(host2.status) || host1.name.localeCompare(host2.name);
}
