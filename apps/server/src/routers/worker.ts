import { eventSchema } from "@server//schemas";
import prisma from "../../prisma";

// prevents TS errors
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
					const host = await prisma.host.update({
						where: { id: parse.data.id },
						data: {
							status: Math.random() > 0.1 ? "RUNNING" : "ERROR",
							lastStatusChange: new Date(),
						},
					});
					self.postMessage({ type: "host.updated", host });
				},
				5_000 + (Math.random() * 10_000),
			);
			break;
		case "database.creating":
			setTimeout(
				async () => {
					console.log("creating db");
					const db = await prisma.managedDatabase.update({
						where: { id: parse.data.id },
						data: {
							status: "RUNNING",
							lastStatusChange: new Date(),
						},
					});
                    self.postMessage({ type: "managedDatabase.updated", db });
				},
				10_000 + Math.random() * 5_000,
			);
			break;
		case "database.upgrading":
			setTimeout(
				async () => {
					console.log("upgrading db");
					const db = await prisma.managedDatabase.update({
						where: { id: parse.data.id },
						data: {
							status: "RUNNING",
							lastStatusChange: new Date(),
						},
					});
                    self.postMessage({ type: "managedDatabase.updated", db });
				},
				5000 + Math.random() * 20_000,
			);
			break;
		case "database.backup":
			setTimeout(async () => {
				console.log("backup db");
				const bkp = await prisma.databaseBackup.update({
					where: { id: parse.data.id },
					data: {
						status: "RUNNING",
					},
				});
                self.postMessage({ type: "databaseBackup.updated", bkp });
			}, Math.random() * 5_000);
			setTimeout(
				async () => {
					console.log("backup ddone");
					const bkp = await prisma.databaseBackup.update({
						where: { id: parse.data.id },
						data: {
							status: "DONE",
						},
					});
                    self.postMessage({ type: "databaseBackup.updated", bkp });
				},
				10_000 + Math.random() * 15_000,
			);
			break;
	}
};
