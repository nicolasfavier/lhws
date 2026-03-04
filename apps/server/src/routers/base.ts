import { ORPCError, os } from "@orpc/server";
import { type eventSchema } from "@server/schemas";
import { z } from "zod";
import prisma from "../../prisma";

const worker = new Worker("@server/routers/worker.ts");

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

export const base = os.use(loggingMiddleware);

export const statusMiddleware = os.middleware(async ({ next }) => {
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
