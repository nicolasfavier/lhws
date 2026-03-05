import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
	isServiceError,
	ServiceUnavailable,
} from "@web/components/service-unavailable";
import { H1 } from "@web/components/typography";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@web/components/ui/card";
import { useDashboard } from "@web/utils/use-dashboard";
import { formatDistanceToNow } from "date-fns";
import Markdown from "react-markdown";

export function Messages() {
	const { data, error, isError } = useDashboard();
	const messages = data?.messages;
	const [ref] = useAutoAnimate();

	return (
		<div className="flex flex-col overflow-hidden">
			<H1>Messages</H1>
			{isServiceError(error, data?.availability?.status) ? (
				<ServiceUnavailable />
			) : (
				<div className="space-y-4 overflow-y-auto" ref={ref}>
					{!isError &&
						messages?.map((message) => (
							<Card key={message.id}>
								<CardHeader>
									<CardTitle>
										<span className="text-muted-foreground">To: </span>
										{message.recipient}
									</CardTitle>
									<CardDescription>
										{formatDistanceToNow(message.createdAt, {
											addSuffix: true,
										})}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Markdown>{message.content}</Markdown>
								</CardContent>
							</Card>
						))}
				</div>
			)}
		</div>
	);
}
