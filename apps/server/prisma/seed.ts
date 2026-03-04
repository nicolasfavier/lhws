import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";
import type { PrismaClient as PrismaClientType } from "./generated/client";

function randomDateBetween(minDays: number, maxDays: number): Date {
	const ms = 24 * 60 * 60 * 1000;
	const offset = (minDays + Math.random() * (maxDays - minDays)) * ms;
	return new Date(Date.now() - offset);
}

export async function seed(prisma: PrismaClientType) {
	await prisma.apiStatus.upsert({
		where: { id: "availability" },
		update: {},
		create: { id: "availability", available: true },
	});

	await prisma.apiStatus.upsert({
		where: { id: "maintenance" },
		update: {},
		create: { id: "maintenance", available: false },
	});

    await prisma.databaseBackup.deleteMany();
	await prisma.managedDatabase.deleteMany();
	await prisma.vM.deleteMany();
	await prisma.right.deleteMany();
	await prisma.host.deleteMany();
	await prisma.user.deleteMany();

	const hostNames = [
		"Coruscant",
		"Tatooine",
		"Naboo",
		"Hoth",
		"Endor",
		"Dagobah",
		"Kamino",
		"Mustafar",
		"Kashyyyk",
		"Alderaan",
		"Bespin",
		"Jakku",
		"Scarif",
		"Mandalore",
		"Lothal",
		"Dathomir",
	];

	const statuses = ["RUNNING", "RUNNING", "RUNNING", "OFF", "OFF", "ERROR"] as const;

	const vmStatuses = ["RUNNING", "RUNNING", "OFF"] as const;

	const hosts = [];

	for (const name of hostNames) {
		const status = statuses[Math.floor(Math.random() * statuses.length)];
		const host = await prisma.host.create({
			data: {
				name,
				status,
				lastStatusChange: randomDateBetween(2, 30),
			},
		});

		hosts.push(host);

		for (let i = 1; i <= 10; i++) {
			const vmName = `${name.toLowerCase()}-${String(i).padStart(2, "0")}`;
			await prisma.vM.create({
				data: {
					name: vmName,
					status: status === "OFF" ? "OFF" : vmStatuses[Math.floor(Math.random() * vmStatuses.length)],
					lastStatusChange: randomDateBetween(2, 30),
					vCPU: [2, 4, 8, 16][Math.floor(Math.random() * 4)],
					ramGB: [4, 8, 16, 32][Math.floor(Math.random() * 4)],
					cpuAvgPercent: Math.floor(Math.random() * 30),
					ramAvgPercent: Math.floor(Math.random() * 20),
					cpuPeakPercent: Math.floor(20 + Math.random() * 20),
					ramPeakPercent: Math.floor(10 + Math.random() * 30),
				},
			});
		}
	}

	const admin = await prisma.user.create({
		data: { email: "takiadmin@takima.fr" },
	});

	for (const host of hosts.slice(0, Math.ceil(hosts.length / 2))) {
		await prisma.right.create({
			data: {
				userId: admin.id,
				hostId: host.id,
				level: "ADMIN",
			},
		});
	}

	const dbTypes = ["POSTGRESQL", "MARIADB"] as const;
	const dbStatuses = ["RUNNING", "RUNNING", "RUNNING", "OFF"] as const;
	const dbVersions: Record<string, string[]> = {
		POSTGRESQL: ["14.2", "15.1", "16.0", "16.3"],
		MARIADB: ["10.6", "10.11", "11.1", "11.4"],
	};
	const dbNames = [
		"analytics", "auth-service", "billing", "catalog",
		"inventory", "logs", "notifications", "sessions",
	];

	for (const name of dbNames) {
		const type = dbTypes[Math.floor(Math.random() * dbTypes.length)];
		const status = dbStatuses[Math.floor(Math.random() * dbStatuses.length)];
		const versions = dbVersions[type];
		await prisma.managedDatabase.create({
			data: {
				type,
				status,
				clusterSize: [1, 2, 3, 5][Math.floor(Math.random() * 4)],
				version: versions[Math.floor(Math.random() * versions.length)],
				lastStatusChange: randomDateBetween(1, 20),
				adminUser: `${name}_admin`,
				adminPassword: `${name}_secret_${Math.random().toString(36).slice(2, 10)}`,
			},
		});
	}

	console.log("Seed completed");
}

// Standalone runner: only executes when run directly (not when imported)
if (import.meta.main) {
	const adapter = new PrismaPg({
		connectionString: process.env.DATABASE_URL,
	});
	const prisma = new PrismaClient({ adapter });

	seed(prisma)
		.catch(console.error)
		.finally(() => prisma.$disconnect());
}
