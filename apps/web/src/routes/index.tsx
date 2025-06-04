import { createFileRoute } from "@tanstack/react-router";
import Header from "@web/components/header";
import { Hosts } from "@web/lib/hosts";
import { Messages } from "@web/lib/messages";
import { Status } from "@web/lib/status";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<div>
			<Header />
			<div className="grid grid-cols-4 p-10">
				<Hosts />
				<Messages />
			</div>
		</div>
	);
}
