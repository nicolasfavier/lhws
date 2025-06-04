// prevents TS errors
//@ts-expect-error
// biome-ignore lint/style/noVar: <explanation>
declare var self: Worker;

self.onmessage = (event: MessageEvent) => {
	console.log(event.data);
	console.log(`Received event ${event}`);
};
