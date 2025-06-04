import { hostSchema } from "@/schemas";
import { os } from "@orpc/server";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import prisma from "../../prisma";

const worker = new Worker("@/routers/worker.ts");

worker.postMessage("hello");

export const appRouter = {
	hosts: os.prefix("/hosts").router({
		list: os
			.route({ method: "GET", path: "/" })
			.output(z.array(hostSchema))
			.handler(async () => prisma.host.findMany()),
		get: os
			.route({ method: "GET", path: "/{id}" })
			.input(z.object({ id: z.string().uuid() }))
			.output(hostSchema)
			.handler(async ({ input }) => {
				const host = await prisma.host.findFirst({ where: { id: input.id } });
				if (!host) throw new ORPCError("NOT_FOUND");
				return host;
			}),
		f: os.route({ method: "GET", path: "/f" }).handler(() => {
			setTimeout(() => console.log("stuff"));
			return "hi";
		}),
		restart: os
			.route({ path: "/{id}/restart" })
			.input(z.object({ id: z.string().uuid() }))
			.output(hostSchema)
			.handler(async ({ input }) => {
				let host = await prisma.host.findFirst({ where: { id: input.id } });
				if (!host) throw new ORPCError("NOT_FOUND");

				host = await prisma.host.update({
					where: { id: input.id },
					data: { status: "STARTING" },
				});

				setTimeout(async () => {
					await prisma.host.update({
						where: { id: input.id },
						data: { status: Math.random() > 0.9 ? "RUNNING" : "ERROR" },
					});
				}, 10);

				return host;
			}),
	}),
};

export type AppRouter = typeof appRouter;
