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
								<div className="mb-1 grid grid-cols-[auto_auto_1fr_auto_1fr] gap-x-2 gap-y-1 text-muted-foreground text-xs">
									<p>Name</p>
									<p>CPU</p>
									<p>RAM</p>
								</div>
								<div className="space-y-2">
									{vms
										?.sort((a, b) => a.name.localeCompare(b.name))
										.map((vm) => (
											<div key={vm.id} className="grid grid-cols-[auto_auto_1fr_auto_1fr] items-center gap-x-2 gap-y-1">
												<p className="row-span-2 text-sm">{vm.name}</p>
												<span className="text-muted-foreground text-xs">AVG</span>
												<div className="flex items-center gap-1">
													<Progress value={vm.cpuAvgPercent} className="flex-1" />
													<span className="w-8 text-right text-muted-foreground text-xs">{vm.cpuAvgPercent}%</span>
												</div>
												<span className="text-muted-foreground text-xs">AVG</span>
												<div className="flex items-center gap-1">
													<Progress value={vm.ramAvgPercent} className="flex-1" />
													<span className="w-8 text-right text-muted-foreground text-xs">{vm.ramAvgPercent}%</span>
												</div>
												<span className="text-muted-foreground text-xs">PEAK</span>
												<div className="flex items-center gap-1">
													<Progress value={vm.cpuPeakPercent} className="flex-1" />
													<span className="w-8 text-right text-muted-foreground text-xs">{vm.cpuPeakPercent}%</span>
												</div>
												<span className="text-muted-foreground text-xs">PEAK</span>
												<div className="flex items-center gap-1">
													<Progress value={vm.ramPeakPercent} className="flex-1" />
													<span className="w-8 text-right text-muted-foreground text-xs">{vm.ramPeakPercent}%</span>
												</div>
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
