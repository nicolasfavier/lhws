import { useState } from "react";
import { Button } from "@web/components/ui/button";
import { Label } from "@web/components/ui/label";
import { Switch } from "@web/components/ui/switch";
import { useDashboard } from "@web/utils/use-dashboard";
import { orpc, queryClient } from "@web/utils/orpc";
import { RotateCw } from "lucide-react";

export function Status() {
	const { data } = useDashboard();
	const isAvailable = data?.availability?.status ?? true;

	return (
		<div className="flex items-center gap-2">
			<Switch
				id="availability"
				checked={isAvailable}
				disabled={!data}
				onCheckedChange={(checked) =>
					orpc.up.update.call({ status: checked })
				}
			/>
			<Label htmlFor="availability" className="cursor-pointer text-sm text-black">
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
				disabled={!data}
				onCheckedChange={(checked) =>
					orpc.maintenance.update.call({ status: checked })
				}
			/>
			<Label htmlFor="maintenance" className="cursor-pointer text-sm text-black">
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
			<span className="text-sm text-black">Reset</span>
		</Button>
	);
}
