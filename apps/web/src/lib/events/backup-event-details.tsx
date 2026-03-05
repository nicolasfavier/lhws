import { cn } from "@web/lib/utils";
import type { WsEvent } from "@web/utils/use-ws-events";

function getStatusColor(status: string) {
	if (status === "DONE") return "text-green-500";
	if (status === "RUNNING") return "text-yellow-500";
	if (status === "SCHEDULED") return "text-blue-500";
	return "text-muted-foreground";
}

export function BackupEventDetails({ event }: { event: WsEvent }) {
	if (!event.backup) return null;
	return (
		<>
			<td className="px-4 py-2">
				<span className="font-medium font-mono text-xs">
					{event.backup.id.slice(0, 4)}…{event.backup.id.slice(-4)}
				</span>
				<span className="ml-2 text-xs text-muted-foreground">
					db {event.backup.targetDatabaseId.slice(0, 4)}…{event.backup.targetDatabaseId.slice(-4)}
				</span>
			</td>
			<td className="px-4 py-2">
				<span className={cn("font-medium text-xs", getStatusColor(event.backup.status))}>
					{event.backup.status}
				</span>
			</td>
		</>
	);
}
