import { createFileRoute } from "@tanstack/react-router";
import { Hosts } from "@web/lib/hosts";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<div className="grid grid-cols-4 p-10">
			<Hosts />
		</div>
	);
}
