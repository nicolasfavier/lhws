import { MaintenanceMode, Status } from "@web/lib/status";

export default function Header() {
	return (
		<header className="flex items-center bg-[#f9f8f7] px-10">
			<img src="/logo.png" alt="logo" className="w-32" />
			<div className="ml-auto flex items-center gap-6">
				<span className="text-sm font-semibold text-black">
					Admin
				</span>
				<Status />
				<MaintenanceMode />
			</div>
		</header>
	);
}
