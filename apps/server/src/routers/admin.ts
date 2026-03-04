import prisma from "../../prisma";
import { seed } from "../../prisma/seed";
import { base } from "./base";

export const adminRouter = base
	.prefix("/admin")
	.router({
		reset: base
			.route({
				method: "POST",
				path: "/reset",
				tags: ["Admin"],
				summary: "Reset Global State",
			})
			.handler(async () => {
				await seed(prisma);
			}),
	});
