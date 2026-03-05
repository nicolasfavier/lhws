import { useEffect, useRef, useState } from "react";

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
	receivedAt: Date;
}

export function useWsEvents() {
	const [events, setEvents] = useState<WsEvent[]>([]);
	const [connected, setConnected] = useState(false);
	const wsRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
		const wsUrl = serverUrl.replace(/^http/, "ws") + "/ws";
		const ws = new WebSocket(wsUrl);
		wsRef.current = ws;

		ws.onopen = () => setConnected(true);
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
