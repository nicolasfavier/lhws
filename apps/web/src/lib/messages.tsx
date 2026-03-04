import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useStableQuery } from "@web/utils/use-stable-query";
import {
	ServiceUnavailable,
	isServiceError,
} from "@web/components/service-unavailable";
import { H1 } from "@web/components/typography";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@web/components/ui/card";
import { orpc } from "@web/utils/orpc";
import { formatDistanceToNow } from "date-fns";
import Markdown from "react-markdown";

export function Messages() {
	const { data, error, isError } = useStableQuery(
		orpc.messages.list.queryOptions(),
	);
	const [ref] = useAutoAnimate();

	return (
		<div>
			<H1>Messages</H1>
			{isServiceError(error) ? (
				<ServiceUnavailable />
			) : (
				<div className="space-y-4" ref={ref}>
					{!isError &&
						data?.map((message) => (
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
