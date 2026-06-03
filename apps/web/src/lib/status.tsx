import { Button } from "@web/components/ui/button";
import { Switch } from "@web/components/ui/switch";
import { orpc, queryClient } from "@web/utils/orpc";
import { useDashboard } from "@web/utils/use-dashboard";
import { Construction, RotateCw, ShieldAlert, Zap, ZapOff } from "lucide-react";
import { useState } from "react";

export function Status() {
	const { data } = useDashboard();
	const isAvailable = data?.availability?.status ?? false;

	return (
		<div className="flex flex-col items-center gap-1.5 min-w-[120px]">
			<div className="flex items-center gap-2">
				{isAvailable ? (
					<Zap className="h-3.5 w-3.5 text-green-400" />
				) : (
					<ZapOff className="h-3.5 w-3.5 text-red-400" />
				)}
				<span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
					Kill Switch
				</span>
			</div>
			<div className="flex items-center gap-2">
				<Switch
					id="availability"
					checked={isAvailable}
					onCheckedChange={(checked) => {
						if (!checked) {
							new Audio("/switch-off-alert.mp3").play();
						} else {
							new Audio("/switch-on-alert.mp3").play();
						}
						orpc.admin.updateAvailability.call({ status: checked });
					}}
				/>
				<span
					className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
						isAvailable
							? "bg-green-500/15 text-green-400 border-green-500/40"
							: "bg-red-500/15 text-red-400 border-red-500/40 animate-pulse"
					}`}
				>
					{isAvailable ? "ACTIF" : "COUPÉ"}
				</span>
			</div>
		</div>
	);
}

export function MaintenanceMode() {
	const { data } = useDashboard();
	const isMaintenance = data?.maintenance?.status ?? false;

	return (
		<div className="flex flex-col items-center gap-1.5 min-w-[140px]">
			<div className="flex items-center gap-2">
				<Construction className="h-3.5 w-3.5 text-gray-400" />
				<span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
					Maintenance
				</span>
			</div>
			<div className="flex items-center gap-2">
				<Switch
					id="maintenance"
					checked={isMaintenance}
					onCheckedChange={(checked) =>
						orpc.maintenance.update.call({ status: checked })
					}
				/>
				<span
					className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
						isMaintenance
							? "bg-amber-500/15 text-amber-400 border-amber-500/40 animate-pulse"
							: "bg-gray-500/15 text-gray-400 border-gray-600/40"
					}`}
				>
					{isMaintenance ? "ACTIVÉE" : "OFF"}
				</span>
			</div>
		</div>
	);
}

export function ResetState() {
	const [loading, setLoading] = useState(false);

	async function handleReset() {
		setLoading(true);
		new Audio("/dataset-reset.mp3").play();
		await orpc.admin.reset.call({});
		queryClient.invalidateQueries();
		setLoading(false);
	}

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={handleReset}
			disabled={loading}
			className="gap-2 border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-white"
		>
			<RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
			<span className="text-xs font-medium">Reset</span>
		</Button>
	);
}

export function AdminFooter() {
	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-red-800 bg-gray-950 px-6 py-3 shadow-2xl">
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-2 text-red-400 mr-2">
					<ShieldAlert className="h-4 w-4 shrink-0" />
					<div className="flex flex-col">
						<span className="text-xs font-black uppercase tracking-widest">
							Zone Admin
						</span>
						<span className="text-xs text-red-600 font-medium">
							Zone sensible
						</span>
					</div>
				</div>

				<div className="h-10 w-px bg-gray-800 mx-1" />

				<Status />

				<div className="h-10 w-px bg-gray-800 mx-1" />

				<MaintenanceMode />

				<div className="h-10 w-px bg-gray-800 mx-1" />

				<ResetState />
			</div>
		</div>
	);
}

export function MaintenanceBanner() {
	const { data } = useDashboard();
	const isMaintenance = data?.maintenance?.status ?? false;

	if (!isMaintenance) return null;

	return (
		<div className="flex items-center gap-3 bg-amber-500 px-6 py-3 text-amber-950">
			<Construction className="h-5 w-5 shrink-0" />
			<span className="font-bold text-sm">MODE MAINTENANCE ACTIVÉ</span>
			<span className="text-sm">
				— Les utilisateurs voient actuellement une page d'indisponibilité.
			</span>
		</div>
	);
}
