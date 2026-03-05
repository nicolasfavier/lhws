import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@web/components/ui/button";
import { cn } from "@web/lib/utils";
import { BackupEventDetails } from "@web/lib/events/backup-event-details";
import { HostEventDetails } from "@web/lib/events/host-event-details";
import { MaintenanceEventDetails } from "@web/lib/events/maintenance-event-details";
import { ManagedDatabaseEventDetails } from "@web/lib/events/managed-database-event-details";
import { MessageEventDetails } from "@web/lib/events/message-event-details";
import { RightEventDetails } from "@web/lib/events/right-event-details";
import { VmEventDetails } from "@web/lib/events/vm-event-details";
import { type WsEvent, useWsEvents } from "@web/utils/use-ws-events";
import { ArrowLeft, Circle, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/events")({
	component: EventsPage,
});

function EventDetails({ event }: { event: WsEvent }) {
	if (event.host) return <HostEventDetails event={event} />;
	if (event.right) return <RightEventDetails event={event} />;
	if (event.message) return <MessageEventDetails event={event} />;
	if (event.vm) return <VmEventDetails event={event} />;
	if (event.maintenance) return <MaintenanceEventDetails event={event} />;
	if (event.managedDatabase) return <ManagedDatabaseEventDetails event={event} />;
	if (event.backup) return <BackupEventDetails event={event} />;

	return (
		<>
			<td className="px-4 py-2 text-muted-foreground">—</td>
			<td className="px-4 py-2 text-muted-foreground">—</td>
		</>
	);
}

function EventsPage() {
	const { events, connected, clear } = useWsEvents();

	return (
		<div className="flex h-full flex-col gap-4 p-10">
			<div className="flex items-center gap-4">
				<Link to="/">
					<Button variant="outline" size="sm">
						<ArrowLeft className="size-4" />
						Back
					</Button>
				</Link>
				<h1 className="text-2xl font-bold">WebSocket Event Log</h1>
				<div className="flex items-center gap-2 text-sm">
					<Circle
						className={cn(
							"size-3 fill-current",
							connected ? "text-green-500" : "text-red-500",
						)}
					/>
					{connected ? "Connected" : "Disconnected"}
				</div>
				<div className="ml-auto">
					<Button variant="outline" size="sm" onClick={clear}>
						<Trash2 className="size-4" />
						Clear
					</Button>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto rounded-md border">
				{events.length === 0 ? (
					<div className="flex h-full items-center justify-center text-muted-foreground">
						Waiting for events...
					</div>
				) : (
					<table className="w-full text-sm">
						<thead className="sticky top-0 border-b bg-background">
							<tr className="text-left text-muted-foreground">
								<th className="px-4 py-2">Time</th>
								<th className="px-4 py-2">Event</th>
								<th className="px-4 py-2">Subject</th>
								<th className="px-4 py-2">Details</th>
							</tr>
						</thead>
						<tbody>
							{events.map((event, i) => (
								<tr key={i} className="border-b last:border-0 hover:bg-accent">
									<td className="px-4 py-2 font-mono text-xs text-muted-foreground">
										{formatDistanceToNow(event.receivedAt, { addSuffix: true })}
									</td>
									<td className="px-4 py-2 font-mono text-xs">
										{event.type}
									</td>
									<EventDetails event={event} />
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}
