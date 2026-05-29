import {
	hostWithRightsSchema,
	maintenanceStatus,
	managedDatabaseWithBackupsSchema,
	messageSchema,
	vmSchema,
} from "@server/schemas";
import { z } from "zod";
import prisma from "../../prisma";
import { VMStatus } from "@prisma/client";
import { baseNoKillSwitch } from "./base";

export const webRouter = baseNoKillSwitch.prefix("/web").router({
	dashboard: baseNoKillSwitch
		.route({
			method: "GET",
			path: "/",
			tags: ["Dashboard Data"],
			summary: "Refresh Dashboard Data",
		})
		.output(
			z.object({
				hosts: z.array(hostWithRightsSchema),
				vms: z.array(vmSchema),
				messages: z.array(messageSchema),
				managedDatabases: z.array(managedDatabaseWithBackupsSchema),
				availability: maintenanceStatus,
				maintenance: maintenanceStatus,
			}),
		)
		.handler(async () => {
			const hostsDb = await prisma.host.findMany({
				include: { rights: { include: { user: true } } },
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
			const managedDatabases = await prisma.managedDatabase.findMany({
				include: { backups: true },
			});
			return {
				vms,
				hosts,
				messages,
				managedDatabases,
				availability: { status: availabilityStatus.available },
				maintenance: { status: availabilityStatus.maintenance },
			};
		}),
});
