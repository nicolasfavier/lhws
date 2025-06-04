import { z } from "zod";
import { HostStatus } from "../prisma/generated";
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

export const userSchema = z.object({
	id: z.string().uuid(),
	email: z.string().email(),
	level: z.nativeEnum(RightLevel),
});
