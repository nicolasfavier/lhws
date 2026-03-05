import { maintenanceStatus } from "@server/schemas";
import prisma from "../../prisma";
import { base } from "./base";

export const maintenanceRouter = base.prefix("/maintenance").router({
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
                status: status.maintenance,
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
                data: { maintenance: input.status },
            });
            return input;
        }),
});

export const maintenanceLegacyRouter = base.prefix("/maintenance/status").router({
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
				status: status.maintenance,
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
				data: { maintenance: input.status },
			});
			return input;
		}),
});
