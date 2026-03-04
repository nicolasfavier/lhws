import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
	ServiceUnavailable,
	isServiceError,
} from "@web/components/service-unavailable";
import { H1 } from "@web/components/typography";
import { Button } from "@web/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@web/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@web/components/ui/dropdown-menu";
import { Input } from "@web/components/ui/input";
import { Label } from "@web/components/ui/label";
import { cn } from "@web/lib/utils";
import type { Inputs } from "@web/utils/orpc";
import { orpc, queryClient } from "@web/utils/orpc";
import { useDashboard } from "@web/utils/use-dashboard";
import { ArrowUpCircle, Database, HardDriveDownload, Play, Power, Scaling } from "lucide-react";
import { useState } from "react";

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
	const [upgradeTarget, setUpgradeTarget] = useState<ManagedDatabase | null>(null);
	const [scaleTarget, setScaleTarget] = useState<ManagedDatabase | null>(null);
	const [upgradeVersion, setUpgradeVersion] = useState("");
	const [scaleSize, setScaleSize] = useState("");

	const dbsByStatus = Object.groupBy(
		databases ?? [],
		(db) => db.status,
	);

	async function handleStart(id: string) {
		await orpc.managedDatabases.start.call({ id });
		queryClient.invalidateQueries();
	}

	async function handleBackup(targetDatabaseId: string) {
		await orpc.databaseBackups.create.call({ targetDatabaseId });
		queryClient.invalidateQueries();
	}

	async function handleShutdown(id: string) {
		await orpc.managedDatabases.shutdown.call({ id });
		queryClient.invalidateQueries();
	}

	async function handleUpgrade() {
		if (!upgradeTarget) return;
		await orpc.managedDatabases.upgrade.call({
			id: upgradeTarget.id,
			version: upgradeVersion,
		});
		queryClient.invalidateQueries();
		setUpgradeTarget(null);
		setUpgradeVersion("");
	}

	async function handleScale() {
		if (!scaleTarget) return;
		await orpc.managedDatabases.scale.call({
			id: scaleTarget.id,
			clusterSize: Number(scaleSize),
		});
		queryClient.invalidateQueries();
		setScaleTarget(null);
		setScaleSize("");
	}

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
								<DropdownMenu key={db.id}>
									<DropdownMenuTrigger asChild>
										<div className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-accent">
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
													{" · "}{db.backups.length} {db.backups.length === 1 ? "backup" : "backups"}
													{db.backups.some((b) => b.status === "RUNNING") && (
														<span className="ml-1 text-yellow-600 font-medium">· backup in progress</span>
													)}
                                                    {db.backups.some((b) => b.status === "SCHEDULED") && (
                                                        <span className="ml-1 text-yellow-600 font-medium">· backup scheduled</span>
                                                    )}
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
									</DropdownMenuTrigger>
									<DropdownMenuContent align="start">
										<DropdownMenuItem
											onClick={() => {
												setUpgradeTarget(db);
												setUpgradeVersion("");
											}}
										>
											<ArrowUpCircle />
											Upgrade version
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => {
												setScaleTarget(db);
												setScaleSize(String(db.clusterSize));
											}}
										>
											<Scaling />
											Scale cluster
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => handleBackup(db.id)}>
											<HardDriveDownload />
											Create backup
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => handleStart(db.id)}>
											<Play />
											Start
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => handleShutdown(db.id)}>
											<Power />
											Shutdown
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							))}
						</div>

						<Dialog
							open={!!upgradeTarget}
							onOpenChange={(open) => {
								if (!open) setUpgradeTarget(null);
							}}
						>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Upgrade Database</DialogTitle>
									<DialogDescription>
										{upgradeTarget &&
											`Current version: ${upgradeTarget.version}. Enter a higher version number.`}
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-2">
									<Label htmlFor="upgrade-version">New version</Label>
									<Input
										id="upgrade-version"
										value={upgradeVersion}
										onChange={(e) => setUpgradeVersion(e.target.value)}
										placeholder={upgradeTarget ? upgradeTarget.version : ""}
									/>
								</div>
								<DialogFooter>
									<Button
										onClick={handleUpgrade}
										disabled={
											!upgradeVersion ||
											(!!upgradeTarget && upgradeVersion <= upgradeTarget.version)
										}
									>
										Upgrade
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>

						<Dialog
							open={!!scaleTarget}
							onOpenChange={(open) => {
								if (!open) setScaleTarget(null);
							}}
						>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Scale Cluster</DialogTitle>
									<DialogDescription>
										{scaleTarget &&
											`Current cluster size: ${scaleTarget.clusterSize} node(s). Enter the new size.`}
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-2">
									<Label htmlFor="scale-size">Cluster size</Label>
									<Input
										id="scale-size"
										type="number"
										min={1}
										value={scaleSize}
										onChange={(e) => setScaleSize(e.target.value)}
									/>
								</div>
								<DialogFooter>
									<Button
										onClick={handleScale}
										disabled={!scaleSize || Number(scaleSize) < 1}
									>
										Scale
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</>
				)
			)}
		</div>
	);
}
