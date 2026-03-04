import { z } from "zod";
import { HostStatus, ManagedDatabaseStatus, ManagedDatabaseType, RightLevel, VMStatus } from "../prisma/generated/client";

export const eventSchema = z.object({
	id: z.string().uuid(),
	type: z.string(),
});

export function event(payload: z.input<typeof eventSchema>) {
	return eventSchema.parse(payload);
}

export const hostRightSchema = z.object({
	email: z.string().email(),
	level: z.enum(RightLevel),
});


export const hostWithRightsSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    status: z.enum(HostStatus),
    lastStatusChange: z.date(),
    rights: z.array(hostRightSchema),
});

export const hostSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	status: z.enum(HostStatus),
	lastStatusChange: z.date(),
});

export const vmSchema = z.object({
	id: z.string().uuid(),
	status: z.enum(VMStatus),
	name: z.string(),
	lastStatusChange: z.date(),
	vCPU: z.number(),
	ramGB: z.number(),
	cpuAvgPercent: z.number(),
	ramAvgPercent: z.number(),
	cpuPeakPercent: z.number(),
	ramPeakPercent: z.number(),
});

export const vmResizeSchema = z.object({
	id: z.string().uuid(),
	vCPU: z.number(),
	ramGB: z.number(),
});

export const userSchema = z.object({
	id: z.string().uuid(),
	email: z.string().email(),
	level: z.enum(RightLevel),
});

export const messageSchema = z.object({
	id: z.string().uuid(),
	recipient: z.string(),
	content: z.string(),
	createdAt: z.date(),
});

export const managedDatabaseSchema = z.object({
	id: z.string().uuid(),
	type: z.enum(ManagedDatabaseType),
	clusterSize: z.number(),
	version: z.string(),
	lastStatusChange: z.date(),
	status: z.enum(ManagedDatabaseStatus),
	adminUser: z.string(),
	adminPassword: z.string(),
});

export const managedDatabaseCreateSchema = z.object({
	type: z.enum(ManagedDatabaseType),
	clusterSize: z.number(),
	version: z.string(),
	adminUser: z.string(),
	adminPassword: z.string(),
});

export const managedDatabaseUpdateSchema = z.object({
	id: z.string().uuid(),
	type: z.enum(ManagedDatabaseType).optional(),
	clusterSize: z.number().optional(),
	version: z.string().optional(),
	adminUser: z.string().optional(),
	adminPassword: z.string().optional(),
});

export const managedDatabaseUpgradeSchema = z.object({
	id: z.string().uuid(),
	version: z.string(),
});

export const managedDatabaseScaleSchema = z.object({
	id: z.string().uuid(),
	clusterSize: z.number().int().min(1),
});

export const maintenanceStatus = z.object({
	status: z.boolean(),
});
