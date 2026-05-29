import { EventTypes } from "@server/event-types";

interface WsClient {
	send(message: string): void;
}

const clientSubscriptions = new Map<WsClient, Set<string>>();

export function addClient(ws: WsClient) {
	clientSubscriptions.set(ws, new Set(EventTypes.all()));
}

export function removeClient(ws: WsClient) {
	clientSubscriptions.delete(ws);
}

export function handleClientMessage(ws: WsClient, message: string) {
	try {
		const data = JSON.parse(message);
		if (data.action === "subscribe" && Array.isArray(data.events)) {
			clientSubscriptions.set(ws, new Set(data.events as string[]));
		}
	} catch {
		// ignore invalid messages
	}
}

function broadcast(data: Record<string, unknown>) {
	const type = data.type as string;
	const message = JSON.stringify(data);
	for (const [client, subscriptions] of clientSubscriptions) {
		if (subscriptions.has(type)) {
			client.send(message);
		}
	}
}

export function broadcastHostEvent(
	type: "host.created" | "host.updated" | "host.deleted",
	host: { id: string; name: string; status: string; lastStatusChange: Date },
) {
	broadcast({ type, host });
}

export function broadcastRightEvent(
	type: "right.created" | "right.updated" | "right.deleted",
	right: { id: string; hostId: string; email: string; level: string },
) {
	broadcast({ type, right });
}

export function broadcastMessageEvent(
	type: "message.created" | "message.deleted",
	message: { id: string; recipient: string; content: string; createdAt: Date },
) {
	broadcast({ type, message });
}

export function broadcastVmEvent(
	type: "vm.created" | "vm.started" | "vm.resized" | "vm.deleted",
	vm: { id: string; name: string; status: string },
) {
	broadcast({ type, vm });
}

export function broadcastMaintenanceEvent(
	type: "maintenance.updated",
	maintenance: { status: boolean },
) {
	broadcast({ type, maintenance });
}

export function broadcastManagedDatabaseEvent(
	type: "managedDatabase.created" | "managedDatabase.updated" | "managedDatabase.deleted",
	managedDatabase: { id: string; type: string; status: string; version: string; clusterSize: number },
) {
	broadcast({ type, managedDatabase });
}

export function broadcastDatabaseBackupEvent(
	type: "databaseBackup.created" | "databaseBackup.updated" | "databaseBackup.deleted",
	backup: { id: string; targetDatabaseId: string; status: string },
) {
	broadcast({ type, backup });
}

export function broadcastResetEvent() {
	broadcast({ type: "admin.reset" });
}
