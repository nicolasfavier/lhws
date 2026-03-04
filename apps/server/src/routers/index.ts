import { ORPCError, os } from "@orpc/server";
import {type eventSchema, hostWithRightsSchema} from "@server/schemas";
import {
	hostSchema,
	maintenanceStatus,
	messageSchema,
	userSchema,
	vmResizeSchema,
	vmSchema,
} from "@server/schemas";
import { subMinutes } from "date-fns";
import { z } from "zod";
import prisma from "../../prisma";
import { seed } from "../../prisma/seed";
import { VMStatus } from "../../prisma/generated/client";

const worker = new Worker("@server/routers/worker.ts");

function postEvent(event: z.input<typeof eventSchema>) {
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

const base = os.use(loggingMiddleware);

const statusMiddleware = os.middleware(async ({ next }) => {
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

export const appRouter = base.router({
	up: base.prefix("/available/status").router({
		get: base
			.route({
				method: "GET",
				path: "/",
				tags: ["Maintenance"],
				summary: "Get Maintenance Status",
			})
			.output(maintenanceStatus)
			.handler(async () => {
				const status = await prisma.apiStatus.findFirstOrThrow({
					where: { id: "availability" },
				});
				return {
					status: status.available,
				};
			}),
		update: base
			.route({
				method: "POST",
				path: "/",
				tags: ["Maintenance"],
				summary: "Update Maintenance Status",
			})
			.output(maintenanceStatus)
			.input(maintenanceStatus)
			.handler(async ({ input }) => {
				const currentStatus = await prisma.apiStatus.findFirstOrThrow({
					where: { id: "availability" },
				});
				await prisma.apiStatus.update({
					where: { id: currentStatus.id },
					data: { available: input.status },
				});
				return input;
			}),
	}),
	maintenance: base.prefix("/maintenance/status").router({
		get: base
			.route({
				method: "GET",
				path: "/",
				tags: ["Maintenance"],
				summary: "Get Maintenance Status",
			})
			.output(maintenanceStatus)
			.handler(async () => {
				const status = await prisma.apiStatus.findFirstOrThrow({
					where: { id: "maintenance" },
				});
				return {
					status: status.available,
				};
			}),
		update: base
			.route({
				method: "POST",
				path: "/",
				tags: ["Maintenance"],
				summary: "Update Maintenance Status",
			})
			.output(maintenanceStatus)
			.input(maintenanceStatus)
			.handler(async ({ input }) => {
				const currentStatus = await prisma.apiStatus.findFirstOrThrow({
					where: { id: "maintenance" },
				});
				await prisma.apiStatus.update({
					where: { id: currentStatus.id },
					data: { available: input.status },
				});
				return input;
			}),
	}),
	messages: base
		.use(statusMiddleware)
		.prefix("/messages")
		.router({
			list: base
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
						take: 6,
					});
				}),
			create: base
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
	vms: base
		.prefix("/vms")
		.use(statusMiddleware)
		.router({
			list: base
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
								not: VMStatus.OFF,
							},
						},
					});
				}),
			get: base
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
								not: VMStatus.OFF,
							},
						},
					});
					if (!vm) throw new ORPCError("NOT_FOUND");
					return vm;
				}),
			start: base
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
			resize: base
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

			delete: base
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
	hosts: base
		.prefix("/hosts")
		.use(statusMiddleware)
		.router({
			list: base
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
			survivors: base
				.route({
					method: "GET",
					path: "/survivors",
					tags: ["Hosts"],
					summary: "List Survivor Hosts",
				})
				.output(z.array(hostSchema))
				.handler(async () => {
					const hosts = await prisma.host.findMany({
						where: { lastStatusChange: { lte: subMinutes(new Date(), 7) } },
						include: { rights: { include: { user: true } } },
					});
					return hosts.map((host) => ({
						...host,
						rights: host.rights.map((r) => ({
							email: r.user.email,
							level: r.level,
						})),
					}));
				}),
			get: base
				.route({
					method: "GET",
					path: "/{id}",
					tags: ["Hosts"],
					summary: "Get Host by ID",
				})
				.input(z.object({ id: z.string().uuid() }))
				.output(hostSchema)
				.handler(async ({ input }) => {
					const host = await prisma.host.findFirst({
						where: { id: input.id },
						include: { rights: { include: { user: true } } },
					});
					if (!host) throw new ORPCError("NOT_FOUND");
					return {
						...host,
						rights: host.rights.map((r) => ({
							email: r.user.email,
							level: r.level,
						})),
					};
				}),
			restart: base
				.route({
					path: "/{id}/restart",
					tags: ["Hosts"],
					summary: "Restart Host",
				})
				.input(z.object({ id: z.string().uuid() }))
				.output(hostSchema)
				.handler(async ({ input }) => {
					const existing = await prisma.host.findFirst({
						where: { id: input.id },
					});
					if (!existing) throw new ORPCError("NOT_FOUND");

					const host = await prisma.host.update({
						where: { id: input.id },
						data: { status: "STARTING", lastStatusChange: new Date() },
						include: { rights: { include: { user: true } } },
					});

					postEvent({ id: input.id, type: "host.starting" });

					return {
						...host,
						rights: host.rights.map((r) => ({
							email: r.user.email,
							level: r.level,
						})),
					};
				}),
			shutdown: base
				.route({
					path: "/{id}/shutdown",
					tags: ["Hosts"],
					summary: "Shutdown Host",
				})
				.input(z.object({ id: z.string().uuid() }))
				.output(hostSchema)
				.handler(async ({ input }) => {
					const existing = await prisma.host.findFirst({
						where: { id: input.id },
					});
					if (!existing) throw new ORPCError("NOT_FOUND");

					const host = await prisma.host.update({
						where: { id: input.id },
						data: { status: "OFF", lastStatusChange: new Date() },
					});

					return host;
				}),
			users: base.prefix("/{id}/users").router({
				list: base
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

						return users.map(({ level, user, id }) => ({ ...user, level, id }));
					}),
				invite: base
					.route({
						method: "POST",
						path: "/",
						tags: ["Host Users"],
						summary: "Invite User to Host",
					})
					.input(userSchema)
					.output(userSchema)
					.handler(async ({ input }) => {
						console.log(`Creating user ${input}`);
						const user = await prisma.user.upsert({
							update: {},
							create: {
								email: input.email,
							},
							where: { email: input.email },
						});
						console.log({ user });

						const right = await prisma.right.upsert({
							create: {
								hostId: input.id,
								userId: user.id,
								level: input.level,
							},
							update: {
								level: input.level,
							},
							where: {
								hostId_userId: {
									userId: user.id,
									hostId: input.id,
								},
							},
						});
						console.log({ right });

						return {
							id: right.id,
							email: user.email,
							level: right.level,
						};
					}),
				delete: base
					.route({
						method: "DELETE",
						path: "/{userId}",
						tags: ["Host Users"],
						summary: "Remove User from Host",
					})
					.input(z.object({ id: z.string().uuid(), userId: z.string().uuid() }))
					.handler(async ({ input }) => {
						const right = await prisma.right.findFirst({
							where: { id: input.userId, hostId: input.id },
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
    web: base
        .prefix("/web")
        .router({
            dashboard: base
                .route({
                    method: "GET",
                    path: "/",
                    tags: ["Dashboard Data"],
                    summary: "Refresh Dashboard Data",
                })
                .output(z.object({ hosts: z.array(hostWithRightsSchema), vms: z.array(vmSchema), messages: z.array(messageSchema), availability: maintenanceStatus, maintenance: maintenanceStatus}))
                .handler(async () => {
                    const hostsDb = await prisma.host.findMany({
                        include: {rights: {include: {user: true}}},
                    });
                    const hosts = hostsDb.map((host) => ({
                        ...host,
                        rights: host.rights.map((r) => ({
                            email: r.user.email,
                            level: r.level,
                        })),
                    }));
                    const vms = await prisma.vM.findMany({
                        where: {
                            status: {
                                not: VMStatus.OFF,
                            },
                        },
                    });
                    const messages = await prisma.message.findMany({
                        orderBy: { createdAt: "desc" },
                        take: 6,
                    });
                    const availabilityStatus = await prisma.apiStatus.findFirstOrThrow({
                        where: { id: "availability" },
                    });
                    const maintenanceStatusDb = await prisma.apiStatus.findFirstOrThrow({
                        where: { id: "maintenance" },
                    });
                    return {
                        vms,
                        hosts,
                        messages,
                        availability: { status: availabilityStatus.available },
                        maintenance: { status: maintenanceStatusDb.available },
                    }
                }),
        }),
    admin: base
        .prefix("/admin")
        .router({
            reset: base
                .route({
                    method: "POST",
                    path: "/reset",
                    tags: ["Admin"],
                    summary: "Reset Global State",
                })
                .handler(async () => {
                    await seed(prisma);
                }),
        }),
});

export type AppRouter = typeof appRouter;
