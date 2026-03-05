import { TriangleAlert } from "lucide-react";

export function ServiceUnavailable() {
	return (
		<div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/50 border-dashed bg-destructive/5 p-6 text-center">
			<TriangleAlert className="size-8 text-destructive" />
			<p className="font-semibold text-destructive text-sm">
				Service Unavailable
			</p>
			<p className="text-muted-foreground text-xs">
				The server is currently unavailable. Please try again later.
			</p>
		</div>
	);
}

export function isServiceError(
	error: Error | null,
	available: boolean | undefined,
): boolean {
    if (available !== undefined && !available) return true;
	if (!error) return false;
	if (!("status" in error)) return false;
	const status = (error as { status: number }).status;
	return status === 503 || status === 500;
}
