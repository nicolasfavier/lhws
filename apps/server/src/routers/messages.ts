import { messageSchema } from "@server/schemas";
import { z } from "zod";
import prisma from "../../prisma";
import { base, statusMiddleware } from "./base";

export const messagesRouter = base
	.use(statusMiddleware)
	.prefix("/messages")
	.router({
		list: base
			.route({
				method: "GET",
				path: "/",
				tags: ["Messages"],
				summary: "List Recent Messages",
			})
			.output(z.array(messageSchema))
			.handler(async () => {
				return prisma.message.findMany({
					orderBy: { createdAt: "desc" },
					take: 6,
				});
			}),
		create: base
			.route({
				method: "POST",
				path: "/",
				tags: ["Messages"],
				summary: "Create New Message",
			})
			.output(messageSchema)
			.input(messageSchema.omit({ createdAt: true, id: true }))
			.handler(async ({ input }) => {
				return prisma.message.create({ data: input });
			}),
	});
