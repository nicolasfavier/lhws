import type { PropsWithChildren } from "react";

export function H1({ children }: PropsWithChildren) {
	return (
		<h1 className="mb-10 scroll-m-20 text-balance text-center font-extrabold text-4xl tracking-tight">
			{children}
		</h1>
	);
}
