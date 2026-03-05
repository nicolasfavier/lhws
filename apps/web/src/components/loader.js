import { Loader2 } from "lucide-react";
import { jsx as _jsx } from "react/jsx-runtime";
export default function Loader() {
	return _jsx("div", {
		className: "flex h-full items-center justify-center pt-8",
		children: _jsx(Loader2, { className: "animate-spin" }),
	});
}
