import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useQuery } from "@tanstack/react-query";
import { H1 } from "@web/components/typography";
import { Progress } from "@web/components/ui/progress";
import { orpc } from "@web/utils/orpc";

export function Vms() {
	const { data, isError } = useQuery(orpc.vms.list.queryOptions());
	const [ref] = useAutoAnimate();

	return (
		<div>
			<H1>Virtual Machines</H1>
			<div className="mb-4 grid grid-cols-3 gap-1">
				<p>Name</p>
				<p>CPU</p>
				<p>RAM</p>
			</div>
			<div className="space-y-3" ref={ref}>
				{!isError &&
					data
						?.sort(
							(a, b) =>
								new Date(b.lastStatusChange).valueOf() -
								new Date(a.lastStatusChange).valueOf(),
						)
						?.map((vm) => (
							<div key={vm.id} className="grid grid-cols-3 gap-1">
								<p className="row-span-2">{vm.name}</p>
								<Progress value={vm.cpuAvgPercent} />
								<Progress value={vm.cpuPeakPercent} />
								<Progress value={vm.ramAvgPercent} />
								<Progress value={vm.ramPeakPercent} />
							</div>
						))}
			</div>
		</div>
	);
}
