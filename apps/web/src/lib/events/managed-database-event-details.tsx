import { cn } from "@web/lib/utils";
import type { WsEvent } from "@web/utils/use-ws-events";

function getStatusColor(status: string) {
	if (status === "RUNNING") return "text-green-500";
	if (status === "CREATING") return "text-blue-500";
	if (status === "UPGRADING") return "text-yellow-500";
	if (status === "OFF") return "text-gray-400";
	return "text-muted-foreground";
}

function getTypeLabel(type: string) {
	return type === "POSTGRESQL" ? "PostgreSQL" : "MariaDB";
}

export function ManagedDatabaseEventDetails({ event }: { event: WsEvent }) {
	if (!event.managedDatabase) return null;
	return (
		<>
			<td className="px-4 py-2">
				<span className="font-medium">
					{getTypeLabel(event.managedDatabase.type)} v{event.managedDatabase.version}
				</span>
				<span className="ml-2 text-xs text-muted-foreground">
					{event.managedDatabase.clusterSize} {event.managedDatabase.clusterSize === 1 ? "node" : "nodes"}
				</span>
				<span className="ml-2 font-mono text-xs text-muted-foreground">
					{event.managedDatabase.id.slice(0, 4)}…{event.managedDatabase.id.slice(-4)}
				</span>
			</td>
			<td className="px-4 py-2">
				<span className={cn("font-medium text-xs", getStatusColor(event.managedDatabase.status))}>
					{event.managedDatabase.status}
				</span>
			</td>
		</>
	);
}
