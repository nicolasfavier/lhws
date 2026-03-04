import { Label } from "@web/components/ui/label";
import { Switch } from "@web/components/ui/switch";
import { useDashboard } from "@web/utils/use-dashboard";
import { orpc } from "@web/utils/orpc";

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
