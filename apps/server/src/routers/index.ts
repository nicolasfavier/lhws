import { base } from "./base";
import { upRouter, maintenanceRouter } from "./maintenance";
import { messagesRouter } from "./messages";
import { vmsRouter } from "./vms";
import { hostsRouter } from "./hosts";
import { managedDatabasesRouter } from "./managed-databases";
import { databaseBackupsRouter } from "./database-backups";
import { webRouter } from "./web";
import { adminRouter } from "./admin";

export const appRouter = base.router({
	up: upRouter,
	maintenance: maintenanceRouter,
	messages: messagesRouter,
	vms: vmsRouter,
	hosts: hostsRouter,
	managedDatabases: managedDatabasesRouter,
	databaseBackups: databaseBackupsRouter,
	web: webRouter,
	admin: adminRouter,
});

export type AppRouter = typeof appRouter;
