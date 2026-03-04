import { TriangleAlert } from "lucide-react";

export function ServiceUnavailable() {
	return (
		<div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-destructive/50 bg-destructive/5 p-6 text-center">
			<TriangleAlert className="size-8 text-destructive" />
			<p className="font-semibold text-destructive text-sm">
				Service Unavailable
			</p>
			<p className="text-muted-foreground text-xs">
				The server returned a 503 error. Please try again later.
			</p>
		</div>
	);
}

export function isServiceError(error: Error | null): boolean {
	if (!error) return false;
	if (!("status" in error)) return false;
	const status = (error as { status: number }).status;
	return status === 503 || status === 500;
}
