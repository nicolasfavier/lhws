import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
	ServiceUnavailable,
	isServiceError,
} from "@web/components/service-unavailable";
import { H1 } from "@web/components/typography";
import { Progress } from "@web/components/ui/progress";
import { useDashboard } from "@web/utils/use-dashboard";

function getHostName(vmName: string) {
	const last = vmName.lastIndexOf("-");
	return last > 0 ? vmName.slice(0, last) : vmName;
}

export function Vms() {
	const { data, error, isError } = useDashboard();
	const vms = data?.vms;
	const [ref] = useAutoAnimate();

	const grouped = Object.entries(
		Object.groupBy(vms ?? [], (vm) => getHostName(vm.name)),
	).sort(([a], [b]) => a.localeCompare(b));

	return (
		<div>
			<H1>Virtual Machines</H1>
			{isServiceError(error) ? (
				<ServiceUnavailable />
			) : (
				!isError && (
					<div className="space-y-6" ref={ref}>
						{grouped.map(([host, vms]) => (
							<div key={host}>
								<h3 className="mb-2 font-semibold text-sm capitalize">
									{host}
								</h3>
								<div className="mb-1 grid grid-cols-3 gap-1 text-muted-foreground text-xs">
									<p>Name</p>
									<p>CPU</p>
									<p>RAM</p>
								</div>
								<div className="space-y-2">
									{vms
										?.sort((a, b) => a.name.localeCompare(b.name))
										.map((vm) => (
											<div key={vm.id} className="grid grid-cols-3 gap-1">
												<p className="row-span-2 text-sm">{vm.name}</p>
												<Progress value={vm.cpuAvgPercent} />
												<Progress value={vm.cpuPeakPercent} />
												<Progress value={vm.ramAvgPercent} />
												<Progress value={vm.ramPeakPercent} />
											</div>
										))}
								</div>
							</div>
						))}
					</div>
				)
			)}
		</div>
	);
}
