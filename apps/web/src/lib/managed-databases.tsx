import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
	ServiceUnavailable,
	isServiceError,
} from "@web/components/service-unavailable";
import { H1 } from "@web/components/typography";
import { cn } from "@web/lib/utils";
import type { Inputs } from "@web/utils/orpc";
import { useDashboard } from "@web/utils/use-dashboard";
import { Database } from "lucide-react";

type ManagedDatabase = Inputs["web"]["dashboard"]["managedDatabases"][number];

const STATUS_ORDER: ManagedDatabase["status"][] = [
	"CREATING",
	"UPGRADING",
	"RUNNING",
];

function getStatusBadgeClassName(status: ManagedDatabase["status"]) {
	if (status === "RUNNING") return "bg-green-300 text-green-800";
	if (status === "CREATING") return "bg-blue-300 text-blue-800";
	if (status === "UPGRADING") return "bg-yellow-300 text-yellow-800";
	return "bg-gray-300 text-gray-800";
}

function getDotClassName(status: ManagedDatabase["status"]) {
	if (status === "RUNNING") return "bg-green-500";
	if (status === "CREATING") return "bg-blue-500";
	if (status === "UPGRADING") return "bg-yellow-500";
	return "bg-gray-400";
}

function getTypeLabel(type: ManagedDatabase["type"]) {
	return type === "POSTGRESQL" ? "PostgreSQL" : "MariaDB";
}

function sort(a: ManagedDatabase, b: ManagedDatabase) {
	const order = ["CREATING", "UPGRADING", "RUNNING", "OFF"];
	return (
		order.indexOf(a.status) - order.indexOf(b.status) ||
		a.type.localeCompare(b.type)
	);
}

export function ManagedDatabases() {
	const { data, error, isError } = useDashboard();
	const databases = data?.managedDatabases;
	const [ref] = useAutoAnimate();

	const dbsByStatus = Object.groupBy(
		databases ?? [],
		(db) => db.status,
	);

	return (
		<div className="space-y-6">
			<H1>Managed Databases</H1>
			{isServiceError(error) ? (
				<ServiceUnavailable />
			) : (
				!isError && (
					<>
						<div className="grid grid-cols-3 justify-center gap-2">
							{STATUS_ORDER.map((status) => {
								const count = dbsByStatus[status]?.length ?? 0;
								if (count === 0) return null;
								return (
									<p
										key={status}
										className={cn(
											"w-full rounded-full px-2 py-0.5 text-center font-medium text-sm",
											getStatusBadgeClassName(status),
										)}
									>
										{count} {status}
									</p>
								);
							})}
						</div>
						<div className="space-y-1" ref={ref}>
							{[...(databases ?? [])].sort(sort).map((db) => (
								<div
									key={db.id}
									className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent"
								>
									<div
										className={cn(
											"size-3 shrink-0 rounded-full",
											getDotClassName(db.status),
										)}
									/>
									<Database className="size-4 shrink-0 text-muted-foreground" />
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium">
												{getTypeLabel(db.type)} v{db.version}
											</span>
											<span className="text-muted-foreground text-xs">
												{db.clusterSize} {db.clusterSize === 1 ? "node" : "nodes"}
											</span>
										</div>
										<div className="text-muted-foreground text-xs">
											{db.adminUser} / {"••••••••"}
										</div>
									</div>
									<span
										className={cn(
											"shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
											getStatusBadgeClassName(db.status),
										)}
									>
										{db.status}
									</span>
								</div>
							))}
						</div>
					</>
				)
			)}
		</div>
	);
}
