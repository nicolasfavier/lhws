import { z } from "zod";
import { HostStatus, VMStatus } from "../prisma/generated";
import { RightLevel } from "../prisma/generated";

export const eventSchema = z.object({
	id: z.string().uuid(),
	type: z.literal("host.starting"),
});

export function event(payload: z.input<typeof eventSchema>) {
	return eventSchema.parse(payload);
}

export const hostSchema = z.object({
	id: z.string().uuid(),
	status: z.nativeEnum(HostStatus),
	lastStatusChange: z.date(),
});

export const vmSchema = z.object({
	id: z.string().uuid(),
	status: z.nativeEnum(VMStatus),
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
	level: z.nativeEnum(RightLevel),
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
