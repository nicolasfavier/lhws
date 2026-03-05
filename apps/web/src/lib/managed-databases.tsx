import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
	isServiceError,
	ServiceUnavailable,
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@web/components/ui/select";
import { cn } from "@web/lib/utils";
import type { Inputs } from "@web/utils/orpc";
import { orpc, queryClient } from "@web/utils/orpc";
import { useDashboard } from "@web/utils/use-dashboard";
import {
	ArrowUpCircle,
	Database,
	HardDriveDownload,
	Play,
	Plus,
	Power,
	Scaling,
	Trash2,
} from "lucide-react";
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
	const [upgradeTarget, setUpgradeTarget] = useState<ManagedDatabase | null>(
		null,
	);
	const [scaleTarget, setScaleTarget] = useState<ManagedDatabase | null>(null);
	const [upgradeVersion, setUpgradeVersion] = useState("");
	const [scaleSize, setScaleSize] = useState("");
	const [createOpen, setCreateOpen] = useState(false);
	const [createType, setCreateType] = useState<"POSTGRESQL" | "MARIADB">(
		"POSTGRESQL",
	);
	const [createVersion, setCreateVersion] = useState("");
	const [createClusterSize, setCreateClusterSize] = useState("1");
	const [createAdminUser, setCreateAdminUser] = useState("");
	const [createAdminPassword, setCreateAdminPassword] = useState("");

	const dbsByStatus = Object.groupBy(databases ?? [], (db) => db.status);

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

	async function handleDelete(id: string) {
		await orpc.managedDatabases.delete.call({ id });
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

	async function handleCreate() {
		await orpc.managedDatabases.create.call({
			type: createType,
			version: createVersion,
			clusterSize: Number(createClusterSize),
			adminUser: createAdminUser,
			adminPassword: createAdminPassword,
		});
		queryClient.invalidateQueries();
		setCreateOpen(false);
		setCreateType("POSTGRESQL");
		setCreateVersion("");
		setCreateClusterSize("1");
		setCreateAdminUser("");
		setCreateAdminPassword("");
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<H1>Managed Databases</H1>
				<Button size="sm" onClick={() => setCreateOpen(true)}>
					<Plus className="size-4" />
					Create
				</Button>
			</div>
			{isServiceError(error, data?.availability?.status) ? (
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
													<span className="font-medium text-sm">
														{getTypeLabel(db.type)} v{db.version}{" "}
														<span className="text-muted-foreground font-mono">
															{db.id.slice(0, 4)}…{db.id.slice(-4)}
														</span>
													</span>
													<span className="text-muted-foreground text-xs">
														{db.clusterSize}{" "}
														{db.clusterSize === 1 ? "node" : "nodes"}
													</span>
												</div>
												<div className="text-muted-foreground text-xs">
													{db.adminUser} / {"••••••••"}
													{" · "}
													{db.backups.length}{" "}
													{db.backups.length === 1 ? "backup" : "backups"}
													{db.backups.some((b) => b.status === "RUNNING") && (
														<span className="ml-1 font-medium text-yellow-600">
															· backup in progress
														</span>
													)}
													{db.backups.some((b) => b.status === "SCHEDULED") && (
														<span className="ml-1 font-medium text-yellow-600">
															· backup scheduled
														</span>
													)}
												</div>
											</div>
											<span
												className={cn(
													"shrink-0 rounded-full px-2 py-0.5 font-medium text-xs",
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
										<DropdownMenuItem
											className="text-destructive"
											onClick={() => handleDelete(db.id)}
										>
											<Trash2 />
											Delete
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
											(!!upgradeTarget &&
												upgradeVersion <= upgradeTarget.version)
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

						<Dialog open={createOpen} onOpenChange={setCreateOpen}>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Create Managed Database</DialogTitle>
									<DialogDescription>
										Configure and provision a new managed database instance.
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="create-type">Type</Label>
										<Select
											value={createType}
											onValueChange={(v) =>
												setCreateType(v as "POSTGRESQL" | "MARIADB")
											}
										>
											<SelectTrigger className="w-full">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="POSTGRESQL">PostgreSQL</SelectItem>
												<SelectItem value="MARIADB">MariaDB</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="create-version">Version</Label>
										<Input
											id="create-version"
											value={createVersion}
											onChange={(e) => setCreateVersion(e.target.value)}
											placeholder="e.g. 16.1"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="create-cluster-size">Cluster size</Label>
										<Input
											id="create-cluster-size"
											type="number"
											min={1}
											value={createClusterSize}
											onChange={(e) => setCreateClusterSize(e.target.value)}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="create-admin-user">Admin user</Label>
										<Input
											id="create-admin-user"
											value={createAdminUser}
											onChange={(e) => setCreateAdminUser(e.target.value)}
											placeholder="admin"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="create-admin-password">
											Admin password
										</Label>
										<Input
											id="create-admin-password"
											type="password"
											value={createAdminPassword}
											onChange={(e) => setCreateAdminPassword(e.target.value)}
										/>
									</div>
								</div>
								<DialogFooter>
									<Button
										onClick={handleCreate}
										disabled={
											!createVersion ||
											!createAdminUser ||
											!createAdminPassword ||
											Number(createClusterSize) < 1
										}
									>
										Create
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
