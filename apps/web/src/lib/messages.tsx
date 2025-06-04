import { useQuery } from "@tanstack/react-query";
import { H1 } from "@web/components/typography";
import { Card } from "@web/components/ui/card";
import { CardHeader } from "@web/components/ui/card";
import { CardTitle } from "@web/components/ui/card";
import { CardDescription } from "@web/components/ui/card";
import { CardContent } from "@web/components/ui/card";
import { orpc } from "@web/utils/orpc";
import { formatDistanceToNow } from "date-fns";

export function Messages() {
	const { data, isError } = useQuery(orpc.messages.list.queryOptions());

	return (
		<div>
			<H1>Messages</H1>
			{!isError &&
				data?.map((message) => (
					<Card key={message.id}>
						<CardHeader>
							<CardTitle>
								<span className="text-muted-foreground">To: </span>
								{message.recipient}
							</CardTitle>
							<CardDescription>
								{formatDistanceToNow(message.createdAt, { addSuffix: true })}
							</CardDescription>
						</CardHeader>
						<CardContent>{message.content}</CardContent>
					</Card>
				))}
		</div>
	);
}
