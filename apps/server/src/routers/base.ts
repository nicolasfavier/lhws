import { ORPCError, os } from "@orpc/server";
import prisma from "../../prisma";

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
