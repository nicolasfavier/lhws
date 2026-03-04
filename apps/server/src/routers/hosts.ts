import { ORPCError } from "@orpc/server";
import { hostSchema, userSchema } from "@server/schemas";
import { subMinutes } from "date-fns";
import { z } from "zod";
import prisma from "../../prisma";
import { base, postEvent, statusMiddleware } from "./base";

export const hostsRouter = base
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
	});
