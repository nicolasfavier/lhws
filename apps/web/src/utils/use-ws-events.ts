import { useEffect, useRef, useState } from "react";
import { EventTypes } from "./event-types";

export interface WsEvent {
	type: string;
	host?: {
		id: string;
		name: string;
		status: string;
		lastStatusChange: string;
	};
	right?: {
		id: string;
		hostId: string;
		email: string;
		level: string;
	};
	message?: {
		id: string;
		recipient: string;
		content: string;
		createdAt: string;
	};
	vm?: {
		id: string;
		name: string;
		status: string;
	};
	maintenance?: {
		status: boolean;
	};
	managedDatabase?: {
		id: string;
		type: string;
		status: string;
		version: string;
		clusterSize: number;
	};
	backup?: {
		id: string;
		targetDatabaseId: string;
		status: string;
	};
	receivedAt: Date;
}

export function useWsEvents(subscriptions: string[] = EventTypes.all()) {
	const [events, setEvents] = useState<WsEvent[]>([]);
	const [connected, setConnected] = useState(false);
	const wsRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
		const wsUrl = serverUrl.replace(/^http/, "ws") + "/ws";
		const ws = new WebSocket(wsUrl);
		wsRef.current = ws;

		ws.onopen = () => {
			setConnected(true);
			ws.send(JSON.stringify({ action: "subscribe", events: subscriptions }));
		};
		ws.onclose = () => setConnected(false);

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				setEvents((prev) => [{ ...data, receivedAt: new Date() }, ...prev]);
			} catch {
				// ignore non-JSON messages
			}
		};

		return () => {
			ws.close();
		};
	}, []);

	function clear() {
		setEvents([]);
	}

	return { events, connected, clear };
}
