import { useTheme } from "@web/components/theme-provider";
import { Button } from "@web/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@web/components/ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ModeToggle() {
	const { setTheme } = useTheme();
	return _jsxs(DropdownMenu, {
		children: [
			_jsx(DropdownMenuTrigger, {
				asChild: true,
				children: _jsxs(Button, {
					variant: "outline",
					size: "icon",
					children: [
						_jsx(Sun, {
							className:
								"h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0",
						}),
						_jsx(Moon, {
							className:
								"absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100",
						}),
						_jsx("span", { className: "sr-only", children: "Toggle theme" }),
					],
				}),
			}),
			_jsxs(DropdownMenuContent, {
				align: "end",
				children: [
					_jsx(DropdownMenuItem, {
						onClick: () => setTheme("light"),
						children: "Light",
					}),
					_jsx(DropdownMenuItem, {
						onClick: () => setTheme("dark"),
						children: "Dark",
					}),
					_jsx(DropdownMenuItem, {
						onClick: () => setTheme("system"),
						children: "System",
					}),
				],
			}),
		],
	});
}
