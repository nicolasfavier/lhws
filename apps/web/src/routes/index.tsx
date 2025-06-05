import { createFileRoute } from "@tanstack/react-router";
import Header from "@web/components/header";
import { Hosts } from "@web/lib/hosts";
import { Messages } from "@web/lib/messages";
import { Vms } from "@web/lib/vms";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<div>
			<Header />
			<div className="grid grid-cols-3 gap-10 p-10">
				<Hosts />
				<Messages />
				<Vms />
			</div>
		</div>
	);
}
