import { cn } from "@web/lib/utils";
import { jsx as _jsx } from "react/jsx-runtime";

function Skeleton({ className, ...props }) {
	return _jsx("div", {
		"data-slot": "skeleton",
		className: cn("animate-pulse rounded-md bg-accent", className),
		...props,
	});
}
export { Skeleton };
