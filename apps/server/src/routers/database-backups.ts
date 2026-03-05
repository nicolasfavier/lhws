import { ORPCError } from "@orpc/server";
import {
	databaseBackupCreateSchema,
	databaseBackupSchema,
} from "@server/schemas";
import { z } from "zod";
import prisma from "../../prisma";
import { DatabaseBackupStatus } from "../../prisma/generated/client";
import { base, postEvent } from "./base";

export const databaseBackupsRouter = base.prefix("/database-backups").router({
	list: base
		.route({
			method: "GET",
			path: "/",
			tags: ["Database Backups"],
			summary: "List Database Backups",
		})
		.output(z.array(databaseBackupSchema))
		.handler(async () => {
			return prisma.databaseBackup.findMany();
		}),
	get: base
		.route({
			method: "GET",
			path: "/{id}",
			tags: ["Database Backups"],
			summary: "Get Database Backup by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(databaseBackupSchema)
		.handler(async ({ input }) => {
			const backup = await prisma.databaseBackup.findFirst({
				where: { id: input.id },
			});
			if (!backup) throw new ORPCError("NOT_FOUND");
			return backup;
		}),
	create: base
		.route({
			method: "POST",
			path: "/",
			tags: ["Database Backups"],
			summary: "Create Database Backup",
		})
		.input(databaseBackupCreateSchema)
		.output(databaseBackupSchema)
		.handler(async ({ input }) => {
			const result = await prisma.databaseBackup.create({
				data: {
					targetDatabaseId: input.targetDatabaseId,
					status: DatabaseBackupStatus.SCHEDULED,
				},
			});
			postEvent({ id: result.id, type: "database.backup" });
			return result;
		}),
	delete: base
		.route({
			method: "DELETE",
			path: "/{id}",
			tags: ["Database Backups"],
			summary: "Delete Database Backup",
		})
		.input(z.object({ id: z.string().uuid() }))
		.handler(async ({ input }) => {
			const existing = await prisma.databaseBackup.findFirst({
				where: { id: input.id },
			});
			if (!existing) throw new ORPCError("NOT_FOUND");

			await prisma.databaseBackup.delete({
				where: { id: input.id },
			});
		}),
});
