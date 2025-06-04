import { eventSchema } from "@/schemas";
import prisma from "../../prisma";

// prevents TS errors
// biome-ignore lint/style/noVar: <explanation>
declare var self: Worker;

self.onmessage = (event: MessageEvent) => {
	const parse = eventSchema.safeParse(event.data);
	console.log(event);

	if (!parse.success)
		return console.warn(`Unable to parse event. ${parse.error}`);

	switch (parse.data.type) {
		case "host.starting":
			setTimeout(
				async () => {
					console.log("stuff");
					await prisma.host.update({
						where: { id: parse.data.id },
						data: {
							status: Math.random() > 0.1 ? "RUNNING" : "ERROR",
							lastStatusChange: new Date(),
						},
					});
				},
				Math.random() * 60 * 1000,
			);
			break;
	}
};
