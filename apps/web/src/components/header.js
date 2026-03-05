import { MaintenanceMode, ResetState, Status } from "@web/lib/status";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function Header() {
	return _jsxs("header", {
		className: "flex items-center bg-[#f9f8f7] px-10",
		children: [
			_jsx("img", { src: "/logo.png", alt: "logo", className: "w-32" }),
			_jsxs("div", {
				className: "ml-auto flex items-center gap-6",
				children: [
					_jsx("span", {
						className: "text-sm font-semibold text-black",
						children: "Admin",
					}),
					_jsx(Status, {}),
					_jsx(MaintenanceMode, {}),
					_jsx(ResetState, {}),
				],
			}),
		],
	});
}
