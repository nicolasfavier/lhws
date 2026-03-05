import type { WsEvent } from "@web/utils/use-ws-events";

export function MessageEventDetails({ event }: { event: WsEvent }) {
	if (!event.message) return null;
	return (
		<>
			<td className="px-4 py-2">
				<span className="font-medium">To: {event.message.recipient}</span>
				<span className="ml-2 font-mono text-xs text-muted-foreground">
					{event.message.id.slice(0, 4)}…{event.message.id.slice(-4)}
				</span>
			</td>
			<td className="px-4 py-2 max-w-48 truncate text-xs text-muted-foreground">
				{event.message.content}
			</td>
		</>
	);
}
