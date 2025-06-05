import { Status } from "@web/lib/status";
import { MaintenanceMode } from "@web/lib/status";

export default function Header() {
	return (
		// biome-ignore lint/nursery/useSortedClasses: <explanation>
		<header className="flex bg-[#f9f8f7] text-primary-foreground gap-10 px-10">
			<img src="/logo.png" alt="logo" className="w-32" />
			<Status />
			<MaintenanceMode />
		</header>
	);
}
