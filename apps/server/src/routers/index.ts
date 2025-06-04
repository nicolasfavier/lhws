import { os } from "@orpc/server";
import { ORPCError } from "@orpc/server";
import { hostSchema } from "@server/schemas";
import type { eventSchema } from "@server/schemas";
import { userSchema } from "@server/schemas";
import { vmSchema } from "@server/schemas";
import { vmResizeSchema } from "@server/schemas";
import { messageSchema } from "@server/schemas";
import { maintenanceStatus } from "@server/schemas";
import { subMinutes } from "date-fns";
import prisma from "prisma";
import { VMStatus } from "prisma/generated";
import { z } from "zod";

const worker = new Worker("@server/routers/worker.ts");

function postEvent(event: z.input<typeof eventSchema>) {
	worker.postMessage(event);
}

const statusMiddleware = os.middleware(async ({ next }) => {
	const status = await prisma.apiStatus.findFirstOrThrow();
	if (!status.available) throw new ORPCError("SERVICE_UNAVAILABLE");
	return next();
});

export const appRouter = os.router({
	maintenance: os.prefix("/maintenance/status").router({
		get: os
			.route({
				method: "GET",
				path: "/",
				tags: ["Maintenance"],
				summary: "Get Maintenance Status",
			})
			.output(maintenanceStatus)
			.handler(async () => {
				const status = await prisma.apiStatus.findFirstOrThrow();
				return {
					status: status.available,
				};
			}),
		update: os
			.route({
				method: "POST",
				path: "/",
				tags: ["Maintenance"],
				summary: "Update Maintenance Status",
			})
			.output(maintenanceStatus)
			.input(maintenanceStatus)
			.handler(async ({ input }) => {
				const currentStatus = await prisma.apiStatus.findFirstOrThrow();
				await prisma.apiStatus.update({
					where: { id: currentStatus.id },
					data: { available: input.status },
				});
				return input;
			}),
	}),
	messages: os
		.use(statusMiddleware)
		.prefix("/messages")
		.router({
			list: os
				.route({
					method: "GET",
					path: "/",
					tags: ["Messages"],
					summary: "List Recent Messages",
				})
				.output(z.array(messageSchema))
				.handler(async () => {
					return prisma.message.findMany({
						orderBy: { createdAt: "desc" },
						take: 4,
					});
				}),
			create: os
				.route({
					method: "POST",
					path: "/",
					tags: ["Messages"],
					summary: "Create New Message",
				})
				.output(messageSchema)
				.input(messageSchema.omit({ createdAt: true, id: true }))
				.handler(async ({ input }) => {
					return prisma.message.create({ data: input });
				}),
		}),
	vms: os
		.prefix("/vms")
		.use(statusMiddleware)
		.router({
			list: os
				.route({
					method: "GET",
					path: "/",
					tags: ["Virtual Machines"],
					summary: "List Active Virtual Machines",
				})
				.output(z.array(vmSchema))
				.handler(async () => {
					return prisma.vM.findMany({
						where: {
							status: {
								not: VMStatus.OFF, // Exclude entries where status is "off"
							},
						},
					});
				}),
			get: os
				.route({
					method: "GET",
					path: "/{id}",
					tags: ["Virtual Machines"],
					summary: "Get Virtual Machine by ID",
				})
				.input(z.object({ id: z.string().uuid() }))
				.output(vmSchema)
				.handler(async ({ input }) => {
					const vm = await prisma.vM.findFirst({
						where: {
							id: input.id,
							status: {
								not: VMStatus.OFF, // Exclude entries where status is "off"
							},
						},
					});
					if (!vm) throw new ORPCError("NOT_FOUND");
					return vm;
				}),
			start: os
				.route({
					path: "/{id}/start",
					tags: ["Virtual Machines"],
					summary: "Start Virtual Machine",
				})
				.input(z.object({ id: z.string().uuid() }))
				.output(vmSchema)
				.handler(async ({ input }) => {
					let vm = await prisma.vM.findFirst({ where: { id: input.id } });
					if (!vm) throw new ORPCError("NOT_FOUND");

					vm = await prisma.vM.update({
						where: { id: input.id },
						data: { status: VMStatus.RUNNING, lastStatusChange: new Date() },
					});

					return vm;
				}),
			resize: os
				.route({
					path: "/{id}/resize",
					tags: ["Virtual Machines"],
					summary: "Resize Virtual Machine Resources",
				})
				.input(vmResizeSchema)
				.output(vmSchema)
				.handler(async ({ input }) => {
					let vm = await prisma.vM.findFirst({ where: { id: input.id } });
					if (!vm) throw new ORPCError("NOT_FOUND");

					vm = await prisma.vM.update({
						where: { id: input.id },
						data: {
							vCPU: input.vCPU,
							ramGB: input.ramGB,
							cpuPeakPercent: 100,
							ramPeakPercent: 100,
							cpuAvgPercent: 100,
							ramAvgPercent: 100,
							lastStatusChange: new Date(),
						},
					});

					return vm;
				}),

			delete: os
				.route({
					method: "DELETE",
					path: "/{id}",
					tags: ["Virtual Machines"],
					summary: "Delete Virtual Machine",
				})
				.input(z.object({ id: z.string().uuid() }))
				.handler(async ({ input }) => {
					let vm = await prisma.vM.findFirst({
						where: { id: input.id },
					});

					if (!vm) throw new ORPCError("NOT_FOUND");

					vm = await prisma.vM.update({
						where: { id: input.id },
						data: { status: VMStatus.OFF, lastStatusChange: new Date() },
					});

					return vm;
				}),
		}),
	hosts: os
		.prefix("/hosts")
		.use(statusMiddleware)
		.router({
			list: os
				.route({
					method: "GET",
					path: "/",
					tags: ["Hosts"],
					summary: "List All Hosts",
				})
				.output(z.array(hostSchema))
				.handler(async () => {
					return prisma.host.findMany();
				}),
			survivors: os
				.route({
					method: "GET",
					path: "/survivors",
					tags: ["Hosts"],
					summary: "List Survivor Hosts",
				})
				.output(z.array(hostSchema))
				.handler(async () => {
					return prisma.host.findMany({
						where: { lastStatusChange: { lte: subMinutes(new Date(), 7) } },
					});
				}),
			get: os
				.route({
					method: "GET",
					path: "/{id}",
					tags: ["Hosts"],
					summary: "Get Host by ID",
				})
				.input(z.object({ id: z.string().uuid() }))
				.output(hostSchema)
				.handler(async ({ input }) => {
					const host = await prisma.host.findFirst({ where: { id: input.id } });
					if (!host) throw new ORPCError("NOT_FOUND");
					return host;
				}),
			restart: os
				.route({
					path: "/{id}/restart",
					tags: ["Hosts"],
					summary: "Restart Host",
				})
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
					.route({
						method: "GET",
						path: "/",
						tags: ["Host Users"],
						summary: "List Host Users",
					})
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
					.route({
						method: "POST",
						path: "/",
						tags: ["Host Users"],
						summary: "Invite User to Host",
					})
					.input(userSchema)
					.output(userSchema)
					.handler(async ({ input }) => {
						const user = await prisma.user.upsert({
							update: {},
							create: {
								email: input.email,
							},
							where: { email: input.email },
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
					.route({
						method: "DELETE",
						path: "/{userId}",
						tags: ["Host Users"],
						summary: "Remove User from Host",
					})
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
});

export type AppRouter = typeof appRouter;
