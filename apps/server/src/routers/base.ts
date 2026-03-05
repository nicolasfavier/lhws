import { ORPCError, os } from "@orpc/server";
import type { eventSchema } from "@server/schemas";
import type { z } from "zod";
import prisma from "../../prisma";
import { broadcastDatabaseBackupEvent, broadcastHostEvent, broadcastManagedDatabaseEvent } from "./ws";

const worker = new Worker("@server/routers/worker.ts");

worker.onmessage = (event: MessageEvent) => {
	const { type, host, db, bkp } = event.data;
	if (type === "host.updated" && host) {
		broadcastHostEvent("host.updated", host);
	}
	if (type === "managedDatabase.updated" && db) {
		broadcastManagedDatabaseEvent("managedDatabase.updated", db);
	}
	if (type === "databaseBackup.updated" && bkp) {
		broadcastDatabaseBackupEvent("databaseBackup.updated", bkp);
	}
};

export function postEvent(event: z.input<typeof eventSchema>) {
	worker.postMessage(event);
}

const loggingMiddleware = os.middleware(async ({ next, path }) => {
	try {
		return await next();
	} catch (error) {
		if ((error as { status?: number })?.status !== 503) {
			console.error(`[${path}]`, error);
		}
		throw error;
	}
});

export const killSwitchMiddleware = os.middleware(async ({ next }) => {
	if (Math.random() < 0.1)
		throw new ORPCError("SERVICE_UNAVAILABLE", {
			message: "Ooops, i might fail sometimes (like 1 on 10)",
		});
	const status = await prisma.apiStatus.findFirstOrThrow({
		where: { id: "availability" },
	});
	if (!status.available) throw new ORPCError("SERVICE_UNAVAILABLE");
	return next();
});

export const baseNoKillSwitch = os.use(loggingMiddleware);

export const base = os.use(loggingMiddleware).use(killSwitchMiddleware);
