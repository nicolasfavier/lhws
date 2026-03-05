import { maintenanceStatus } from "@server/schemas";
import prisma from "../../prisma";
import { seed } from "../../prisma/seed";
import { base, baseNoKillSwitch } from "./base";
import {
	broadcastDatabaseBackupEvent,
	broadcastHostEvent,
	broadcastManagedDatabaseEvent,
	broadcastMessageEvent,
	broadcastRightEvent,
	broadcastVmEvent,
} from "./ws";

export const adminRouter = baseNoKillSwitch.prefix("/admin").router({
	reset: baseNoKillSwitch
		.route({
			method: "POST",
			path: "/reset",
			tags: ["Admin"],
			summary: "Reset Global State",
		})
		.handler(async () => {
			// Broadcast deletion events for all existing entities
			const oldBackups = await prisma.databaseBackup.findMany();
			for (const b of oldBackups) {
				broadcastDatabaseBackupEvent("databaseBackup.deleted", b);
			}
			const oldDbs = await prisma.managedDatabase.findMany();
			for (const db of oldDbs) {
				broadcastManagedDatabaseEvent("managedDatabase.deleted", db);
			}
			const oldVms = await prisma.vM.findMany();
			for (const vm of oldVms) {
				broadcastVmEvent("vm.deleted", vm);
			}
			const oldMessages = await prisma.message.findMany();
			for (const msg of oldMessages) {
				broadcastMessageEvent("message.deleted", msg);
			}
			const oldRights = await prisma.right.findMany({ include: { user: true } });
			for (const r of oldRights) {
				broadcastRightEvent("right.deleted", {
					id: r.id,
					hostId: r.hostId,
					email: r.user.email,
					level: r.level,
				});
			}
			const oldHosts = await prisma.host.findMany();
			for (const host of oldHosts) {
				broadcastHostEvent("host.deleted", host);
			}

			// Run seed
			await seed(prisma);

			// Broadcast creation events for all new entities
			const newHosts = await prisma.host.findMany();
			for (const host of newHosts) {
				broadcastHostEvent("host.created", host);
			}
			const newRights = await prisma.right.findMany({ include: { user: true } });
			for (const r of newRights) {
				broadcastRightEvent("right.created", {
					id: r.id,
					hostId: r.hostId,
					email: r.user.email,
					level: r.level,
				});
			}
			const newVms = await prisma.vM.findMany();
			for (const vm of newVms) {
				broadcastVmEvent("vm.created", vm);
			}
			const newMessages = await prisma.message.findMany();
			for (const msg of newMessages) {
				broadcastMessageEvent("message.created", msg);
			}
			const newDbs = await prisma.managedDatabase.findMany();
			for (const db of newDbs) {
				broadcastManagedDatabaseEvent("managedDatabase.created", db);
			}
			const newBackups = await prisma.databaseBackup.findMany();
			for (const b of newBackups) {
				broadcastDatabaseBackupEvent("databaseBackup.created", b);
			}
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
