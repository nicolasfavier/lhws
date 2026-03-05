import { cn } from "@web/lib/utils";
import type { WsEvent } from "@web/utils/use-ws-events";

function getStatusColor(status: string) {
	if (status === "RUNNING") return "text-green-500";
	if (status === "STARTING") return "text-blue-500";
	if (status === "ERROR") return "text-red-500";
	if (status === "OFF") return "text-gray-400";
	return "text-yellow-500";
}

export function HostEventDetails({ event }: { event: WsEvent }) {
	if (!event.host) return null;
	return (
		<>
			<td className="px-4 py-2">
				<span className="font-medium">{event.host.name}</span>
				<span className="ml-2 font-mono text-xs text-muted-foreground">
					{event.host.id.slice(0, 4)}…{event.host.id.slice(-4)}
				</span>
			</td>
			<td className="px-4 py-2">
				<span className={cn("font-medium text-xs", getStatusColor(event.host.status))}>
					{event.host.status}
				</span>
			</td>
		</>
	);
}
