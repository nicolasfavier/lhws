import { useQuery } from "@tanstack/react-query";
import { Button } from "@web/components/ui/button";
import { orpc } from "@web/utils/orpc";

export function Status() {
	const { data, isLoading } = useQuery(orpc.maintenance.get.queryOptions());
	const isAvailable = isLoading || data?.status;

	return (
		<Button
			disabled={isLoading}
			className="my-auto h-20 grow text-xl transition-all"
			variant={!isLoading && !isAvailable ? "destructive" : "ghost"}
			onClick={() => orpc.maintenance.update.call({ status: !isAvailable })}
		>
			{isLoading
				? "Loading..."
				: isAvailable
					? "Service available"
					: "SERVICE UNAVAILABLE"}
		</Button>
	);
}
