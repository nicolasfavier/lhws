import { cn } from "@web/lib/utils";
import type { WsEvent } from "@web/utils/use-ws-events";

function getLevelColor(level: string) {
	if (level === "ADMIN") return "text-red-500";
	if (level === "WRITE") return "text-orange-500";
	return "text-blue-500";
}

export function RightEventDetails({ event }: { event: WsEvent }) {
	if (!event.right) return null;
	return (
		<>
			<td className="px-4 py-2">
				<span className="font-medium">{event.right.email}</span>
				<span className="ml-2 font-mono text-xs text-muted-foreground">
					host {event.right.hostId.slice(0, 4)}…{event.right.hostId.slice(-4)}
				</span>
			</td>
			<td className="px-4 py-2">
				<span className={cn("font-medium text-xs", getLevelColor(event.right.level))}>
					{event.right.level}
				</span>
			</td>
		</>
	);
}
