import { maintenanceStatus } from "@server/schemas";
import prisma from "../../prisma";
import { base } from "./base";

export const upRouter = base.prefix("/available/status").router({
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
});

export const maintenanceRouter = base.prefix("/maintenance/status").router({
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
});
