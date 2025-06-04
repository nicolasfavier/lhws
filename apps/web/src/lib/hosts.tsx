import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useQuery } from "@tanstack/react-query";
import { H1 } from "@web/components/typography";
import { cn } from "@web/lib/utils";
import { orpc } from "@web/utils/orpc";
import type { Inputs } from "@web/utils/orpc";

export function Hosts() {
	const hosts = useQuery(
		orpc.hosts.list.queryOptions({
			refetchInterval: 1000,
		}),
	);

	const [ref] = useAutoAnimate();

	const hostsByStatus = Object.groupBy(hosts.data ?? [], (host) => host.status);

	return (
		<div className="max-w-64 space-y-10">
			<H1>Hosts</H1>
			<div className="grid grid-cols-2 justify-center gap-2">
				{Object.entries(hostsByStatus).map(([status, hosts]) => (
					<p
						key={status}
						className={cn(
							"w-full rounded-full px-2 py-0.5 text-center font-medium text-sm",
							// biome-ignore lint/suspicious/noExplicitAny: <explanation>
							getClassName(status as any),
						)}
					>
						{hosts?.length} {status}
					</p>
				))}
			</div>
			<div className="mx-auto flex flex-wrap justify-evenly gap-2" ref={ref}>
				{hosts.data?.sort(sort).map((host) => (
					<div
						key={host.id}
						className={cn(
							"size-10 rounded-full border transition-colors",
							getClassName(host.status),
						)}
					/>
				))}
			</div>
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

function sort(host1: Inputs["hosts"]["get"], host2: Inputs["hosts"]["get"]) {
	const sortOrder = ["ERROR", "STARTING", "RUNNING", "OFF"];
	return sortOrder.indexOf(host1.status) - sortOrder.indexOf(host2.status);
}
