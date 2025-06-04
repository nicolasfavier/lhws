import { z } from "zod";
import { HostStatus } from "../prisma/generated";

export const hostSchema = z.object({
	id: z.string().uuid(),
	status: z.nativeEnum(HostStatus),
	lastStatusChange: z.date(),
});
