import { ORPCError } from "@orpc/server";
import {
	managedDatabaseCreateSchema,
	managedDatabaseScaleSchema,
	managedDatabaseSchema,
	managedDatabaseUpgradeSchema,
} from "@server/schemas";
import { z } from "zod";
import prisma from "../../prisma";
import { ManagedDatabaseStatus } from "../../prisma/generated/client";
import { base, postEvent } from "./base";
import { broadcastManagedDatabaseEvent } from "./ws";

export const managedDatabasesRouter = base.prefix("/managed-databases").router({
	list: base
		.route({
			method: "GET",
			path: "/",
			tags: ["Managed Databases"],
			summary: "List Managed Databases",
		})
		.output(z.array(managedDatabaseSchema))
		.handler(async () => {
			return prisma.managedDatabase.findMany({});
		}),
	get: base
		.route({
			method: "GET",
			path: "/{id}",
			tags: ["Managed Databases"],
			summary: "Get Managed Database by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(managedDatabaseSchema)
		.handler(async ({ input }) => {
			const db = await prisma.managedDatabase.findFirst({
				where: {
					id: input.id,
				},
			});
			if (!db) throw new ORPCError("NOT_FOUND");
			return db;
		}),
	create: base
		.route({
			method: "POST",
			path: "/",
			tags: ["Managed Databases"],
			summary: "Create Managed Database",
		})
		.input(managedDatabaseCreateSchema)
		.output(managedDatabaseSchema)
		.handler(async ({ input }) => {
			const db = await prisma.managedDatabase.create({
				data: {
					...input,
					status: ManagedDatabaseStatus.CREATING,
					lastStatusChange: new Date(),
				},
			});
			postEvent({ id: db.id, type: "database.creating" });
			broadcastManagedDatabaseEvent("managedDatabase.created", db);
			return db;
		}),
	delete: base
		.route({
			method: "DELETE",
			path: "/{id}",
			tags: ["Managed Databases"],
			summary: "Delete Managed Database",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ input }) => {
			const existing = await prisma.managedDatabase.findFirst({
				where: { id: input.id },
			});
			if (!existing) throw new ORPCError("NOT_FOUND");

			const db = await prisma.managedDatabase.update({
				where: { id: input.id },
				data: {
					status: ManagedDatabaseStatus.OFF,
					lastStatusChange: new Date(),
				},
			});
			broadcastManagedDatabaseEvent("managedDatabase.deleted", db);
		}),
	upgrade: base
		.route({
			path: "/{id}/upgrade",
			tags: ["Managed Databases"],
			summary: "Upgrade Managed Database Version",
		})
		.input(managedDatabaseUpgradeSchema)
		.output(managedDatabaseSchema)
		.handler(async ({ input }) => {
			const existing = await prisma.managedDatabase.findFirst({
				where: { id: input.id },
			});
			if (!existing) throw new ORPCError("NOT_FOUND");

			if (input.version <= existing.version) {
				throw new ORPCError("BAD_REQUEST", {
					message: `Version must be higher than current version (${existing.version})`,
				});
			}
			postEvent({ id: input.id, type: "database.upgrading" });
			const db = await prisma.managedDatabase.update({
				where: { id: input.id },
				data: {
					version: input.version,
					status: ManagedDatabaseStatus.UPGRADING,
					lastStatusChange: new Date(),
				},
			});
			broadcastManagedDatabaseEvent("managedDatabase.updated", db);
			return db;
		}),
	scale: base
		.route({
			path: "/{id}/scale",
			tags: ["Managed Databases"],
			summary: "Scale Managed Database Cluster",
		})
		.input(managedDatabaseScaleSchema)
		.output(managedDatabaseSchema)
		.handler(async ({ input }) => {
			const existing = await prisma.managedDatabase.findFirst({
				where: { id: input.id },
			});
			if (!existing) throw new ORPCError("NOT_FOUND");

			const db = await prisma.managedDatabase.update({
				where: { id: input.id },
				data: {
					clusterSize: input.clusterSize,
					lastStatusChange: new Date(),
				},
			});
			broadcastManagedDatabaseEvent("managedDatabase.updated", db);
			return db;
		}),
	start: base
		.route({
			path: "/{id}/start",
			tags: ["Managed Databases"],
			summary: "Start Managed Database",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(managedDatabaseSchema)
		.handler(async ({ input }) => {
			const existing = await prisma.managedDatabase.findFirst({
				where: { id: input.id },
			});
			if (!existing) throw new ORPCError("NOT_FOUND");

			const db = await prisma.managedDatabase.update({
				where: { id: input.id },
				data: {
					status: ManagedDatabaseStatus.RUNNING,
					lastStatusChange: new Date(),
				},
			});
			broadcastManagedDatabaseEvent("managedDatabase.updated", db);
			return db;
		}),
	shutdown: base
		.route({
			path: "/{id}/shutdown",
			tags: ["Managed Databases"],
			summary: "Shutdown Managed Database",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(managedDatabaseSchema)
		.handler(async ({ input }) => {
			const existing = await prisma.managedDatabase.findFirst({
				where: { id: input.id },
			});
			if (!existing) throw new ORPCError("NOT_FOUND");

			const db = await prisma.managedDatabase.update({
				where: { id: input.id },
				data: {
					status: ManagedDatabaseStatus.OFF,
					lastStatusChange: new Date(),
				},
			});
			broadcastManagedDatabaseEvent("managedDatabase.updated", db);
			return db;
		}),
});
