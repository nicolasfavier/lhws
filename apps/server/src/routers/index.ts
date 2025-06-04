import { hostSchema } from "@/schemas";
import type { eventSchema } from "@/schemas";
import { userSchema } from "@/schemas";
import { os } from "@orpc/server";
import { ORPCError } from "@orpc/server";
import { subMinutes } from "date-fns";
import { z } from "zod";
import prisma from "../../prisma";

const worker = new Worker("@/routers/worker.ts");

function postEvent(event: z.input<typeof eventSchema>) {
	worker.postMessage(event);
}

export const appRouter = {
	hosts: os.prefix("/hosts").router({
		list: os
			.route({ method: "GET", path: "/" })
			.output(z.array(hostSchema))
			.handler(async () => {
				return prisma.host.findMany();
			}),
		survivors: os
			.route({ method: "GET", path: "/survivors" })
			.output(z.array(hostSchema))
			.handler(async () => {
				return prisma.host.findMany({
					where: { lastStatusChange: { lte: subMinutes(new Date(), 7) } },
				});
			}),
		get: os
			.route({ method: "GET", path: "/{id}" })
			.input(z.object({ id: z.string().uuid() }))
			.output(hostSchema)
			.handler(async ({ input }) => {
				const host = await prisma.host.findFirst({ where: { id: input.id } });
				if (!host) throw new ORPCError("NOT_FOUND");
				return host;
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
					data: { status: "STARTING", lastStatusChange: new Date() },
				});

				postEvent({ id: input.id, type: "host.starting" });

				return host;
			}),
		users: os.prefix("/{id}/users").router({
			list: os
				.route({ method: "GET", path: "/" })
				.input(z.object({ id: z.string().uuid() }))
				.output(z.array(userSchema))
				.handler(async ({ input }) => {
					const users = await prisma.right.findMany({
						where: { hostId: input.id },
						include: { user: true },
					});

					return users.map(({ level, user }) => ({ ...user, level }));
				}),
			invite: os
				.route({ method: "GET", path: "/" })
				.input(userSchema)
				.output(userSchema)
				.handler(async ({ input }) => {
					const user = await prisma.user.findFirst({
						where: { email: input.email },
					});
					if (!user)
						throw new ORPCError("NOT_FOUND", {
							message: "user with this email not found",
						});

					const right = await prisma.right.create({
						data: {
							hostId: input.id,
							userId: user.id,
							level: input.level,
						},
					});

					return {
						id: right.id,
						email: user.email,
						level: right.level,
					};
				}),
			delete: os
				.route({ method: "DELETE", path: "/{userId}" })
				.input(z.object({ id: z.string().uuid(), userId: z.string().uuid() }))
				.handler(async ({ input }) => {
					const right = await prisma.right.findFirst({
						where: { userId: input.userId, hostId: input.id },
					});

					if (!right) throw new ORPCError("NOT_FOUND");
					if (right.level === "ADMIN")
						throw new ORPCError("UNAUTHORIZED", {
							message: "Cannot delete ADMIN",
						});

					await prisma.right.delete({ where: { id: right.id } });
				}),
		}),
	}),
};

export type AppRouter = typeof appRouter;
