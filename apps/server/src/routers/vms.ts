import { ORPCError } from "@orpc/server";
import { vmResizeSchema, vmSchema } from "@server/schemas";
import { z } from "zod";
import prisma from "../../prisma";
import { VMStatus } from "../../prisma/generated/client";
import { base, statusMiddleware } from "./base";

export const vmsRouter = base
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
	});
