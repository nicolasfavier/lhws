export class EventTypes {
	static readonly HOST = {
		CREATED: "host.created",
		UPDATED: "host.updated",
		DELETED: "host.deleted",
	} as const;

	static readonly RIGHT = {
		CREATED: "right.created",
		UPDATED: "right.updated",
		DELETED: "right.deleted",
	} as const;

	static readonly MESSAGE = {
		CREATED: "message.created",
		DELETED: "message.deleted",
	} as const;

	static readonly VM = {
		CREATED: "vm.created",
		STARTED: "vm.started",
		RESIZED: "vm.resized",
		DELETED: "vm.deleted",
	} as const;

	static readonly MAINTENANCE = {
		UPDATED: "maintenance.updated",
	} as const;

	static readonly MANAGED_DATABASE = {
		CREATED: "managedDatabase.created",
		UPDATED: "managedDatabase.updated",
		DELETED: "managedDatabase.deleted",
	} as const;

	static readonly DATABASE_BACKUP = {
		CREATED: "databaseBackup.created",
		UPDATED: "databaseBackup.updated",
		DELETED: "databaseBackup.deleted",
	} as const;

	static readonly ADMIN = {
		RESET: "admin.reset",
	} as const;

	static all(): string[] {
		return [
			...Object.values(EventTypes.HOST),
			...Object.values(EventTypes.RIGHT),
			...Object.values(EventTypes.MESSAGE),
			...Object.values(EventTypes.VM),
			...Object.values(EventTypes.MAINTENANCE),
			...Object.values(EventTypes.MANAGED_DATABASE),
			...Object.values(EventTypes.DATABASE_BACKUP),
			...Object.values(EventTypes.ADMIN),
		];
	}

	static allFor(entity: "host" | "right" | "message" | "vm" | "maintenance" | "managedDatabase" | "databaseBackup" | "admin"): string[] {
		const map = {
			host: EventTypes.HOST,
			right: EventTypes.RIGHT,
			message: EventTypes.MESSAGE,
			vm: EventTypes.VM,
			maintenance: EventTypes.MAINTENANCE,
			managedDatabase: EventTypes.MANAGED_DATABASE,
			databaseBackup: EventTypes.DATABASE_BACKUP,
			admin: EventTypes.ADMIN,
		};
		return Object.values(map[entity]);
	}
}
