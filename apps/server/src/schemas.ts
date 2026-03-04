import { z } from "zod";
import { HostStatus, RightLevel, VMStatus } from "../prisma/generated/client";

export const eventSchema = z.object({
	id: z.string().uuid(),
	type: z.literal("host.starting"),
});

export function event(payload: z.input<typeof eventSchema>) {
	return eventSchema.parse(payload);
}

export const hostRightSchema = z.object({
	email: z.string().email(),
	level: z.enum(RightLevel),
});

export const hostSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	status: z.enum(HostStatus),
	lastStatusChange: z.date(),
	rights: z.array(hostRightSchema),
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

export const maintenanceStatus = z.object({
	status: z.boolean(),
});
