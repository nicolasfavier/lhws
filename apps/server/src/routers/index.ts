import { adminRouter } from "./admin";
import { baseNoKillSwitch } from "./base";
import { databaseBackupsRouter } from "./database-backups";
import { hostsRouter } from "./hosts";
import {maintenanceLegacyRouter, maintenanceRouter} from "./maintenance";
import { managedDatabasesRouter } from "./managed-databases";
import { messagesRouter } from "./messages";
import { vmsRouter } from "./vms";
import { webRouter } from "./web";

export const appRouter = baseNoKillSwitch.router({
	maintenance: maintenanceRouter,
    maintenanceLegacy: maintenanceLegacyRouter,
	messages: messagesRouter,
	vms: vmsRouter,
	hosts: hostsRouter,
	managedDatabases: managedDatabasesRouter,
	databaseBackups: databaseBackupsRouter,
	web: webRouter,
	admin: adminRouter,
});

export type AppRouter = typeof appRouter;
