import { cn } from "@web/lib/utils";
import type { WsEvent } from "@web/utils/use-ws-events";

export function MaintenanceEventDetails({ event }: { event: WsEvent }) {
	if (!event.maintenance) return null;
	return (
		<>
			<td className="px-4 py-2">
				<span className="font-medium">Maintenance mode</span>
			</td>
			<td className="px-4 py-2">
				<span
					className={cn(
						"font-medium text-xs",
						event.maintenance.status ? "text-yellow-500" : "text-green-500",
					)}
				>
					{event.maintenance.status ? "ENABLED" : "DISABLED"}
				</span>
			</td>
		</>
	);
}
