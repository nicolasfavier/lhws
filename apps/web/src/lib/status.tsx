import { useQuery } from "@tanstack/react-query";
import { Label } from "@web/components/ui/label";
import { Switch } from "@web/components/ui/switch";
import { orpc } from "@web/utils/orpc";

export function Status() {
	const { data, isLoading } = useQuery(orpc.up.get.queryOptions());
	const isAvailable = data?.status ?? true;

	return (
		<div className="flex items-center gap-2">
			<Switch
				id="availability"
				checked={isAvailable}
				disabled={isLoading}
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
	const { data, isLoading } = useQuery(orpc.maintenance.get.queryOptions());
	const isMaintenance = data?.status ?? false;

	return (
		<div className="flex items-center gap-2">
			<Switch
				id="maintenance"
				checked={isMaintenance}
				disabled={isLoading}
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
