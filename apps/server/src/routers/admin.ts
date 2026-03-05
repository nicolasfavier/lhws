import { maintenanceStatus } from "@server/schemas";
import prisma from "../../prisma";
import { seed } from "../../prisma/seed";
import { base, baseNoKillSwitch } from "./base";

export const adminRouter = baseNoKillSwitch.prefix("/admin").router({
	reset: baseNoKillSwitch
		.route({
			method: "POST",
			path: "/reset",
			tags: ["Admin"],
			summary: "Reset Global State",
		})
		.handler(async () => {
			await seed(prisma);
		}),
	getAvailability: baseNoKillSwitch
		.route({
			method: "GET",
			path: "/availability",
			tags: ["Availability"],
			summary: "Get Availability Status",
		})
		.output(maintenanceStatus)
		.handler(async () => {
			const status = await prisma.apiStatus.findFirstOrThrow({
				where: { id: "availability" },
			});
			return {
				status: status.maintenance,
			};
		}),
	updateAvailability: baseNoKillSwitch
		.route({
			method: "POST",
			path: "/availability",
			tags: ["Availability"],
			summary: "Update Availability Status",
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
