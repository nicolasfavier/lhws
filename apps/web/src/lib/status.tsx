import { Button } from "@web/components/ui/button";
import { Label } from "@web/components/ui/label";
import { Switch } from "@web/components/ui/switch";
import { orpc, queryClient } from "@web/utils/orpc";
import { useDashboard } from "@web/utils/use-dashboard";
import { RotateCw } from "lucide-react";
import { useState } from "react";

export function Status() {
	const { data } = useDashboard();
	const isAvailable = data?.availability?.status ?? false;

	return (
		<div className="flex items-center gap-2">
			<Switch
				id="availability"
				checked={isAvailable}
				onCheckedChange={(checked) =>
					orpc.admin.updateAvailability.call({ status: checked })
				}
			/>
			<Label
				htmlFor="availability"
				className="cursor-pointer text-black text-sm"
			>
				Kill Switch
			</Label>
		</div>
	);
}

export function MaintenanceMode() {
	const { data } = useDashboard();
	const isMaintenance = data?.maintenance?.status ?? false;

	return (
		<div className="flex items-center gap-2">
			<Switch
				id="maintenance"
				checked={isMaintenance}
				onCheckedChange={(checked) =>
					orpc.maintenance.update.call({ status: checked })
				}
			/>
			<Label
				htmlFor="maintenance"
				className="cursor-pointer text-black text-sm"
			>
				Maintenance mode
			</Label>
		</div>
	);
}

export function ResetState() {
	const [loading, setLoading] = useState(false);

	async function handleReset() {
		setLoading(true);
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
			className="gap-2"
		>
			<RotateCw className={loading ? "animate-spin" : ""} />
			<span className="text-black text-sm">Reset</span>
		</Button>
	);
}
