import { createFileRoute } from "@tanstack/react-router";
import Header from "@web/components/header";
import { Hosts } from "@web/lib/hosts";
import { AdminFooter, MaintenanceBanner } from "@web/lib/status";
import { ManagedDatabases } from "@web/lib/managed-databases";
import { Messages } from "@web/lib/messages";
import { Vms } from "@web/lib/vms";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<div className="pb-20">
			<Header />
			<MaintenanceBanner />
			<div className="grid grid-cols-3 gap-10 p-10">
				<Hosts />
				<ManagedDatabases />
				<Messages />
				<Vms />
			</div>
			<AdminFooter />
		</div>
	);
}
