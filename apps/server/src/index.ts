import "dotenv/config";
import { OpenAPIGenerator } from "@orpc/openapi";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { CORSPlugin } from "@orpc/server/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
import { appRouter } from "@server/routers";

const handler = new OpenAPIHandler(appRouter, {
	plugins: [new CORSPlugin()],
});

const openAPIGenerator = new OpenAPIGenerator({
	schemaConverters: [new ZodToJsonSchemaConverter()],
});

Bun.serve({
	async fetch(request: Request) {
		const { matched, response } = await handler.handle(request, {
			prefix: "/api",
		});

		const url = new URL(request.url);

		if (matched) {
			return response;
		}

		if (url.pathname === "/spec.json") {
			const spec = await openAPIGenerator.generate(appRouter, {
				info: {
					title: "HLWS",
					description: "QubeRT hackathon",
					version: "1.0.0",
				},
				servers: [
					{ url: "/api" } /** Should use absolute URLs in production */,
				],
			});

			return Response.json(JSON.stringify(spec));
		}

		const html = `
    <!doctype html>
    <html>
      <head>
        <title>My Client</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="https://orpc.unnoq.com/icon.svg" />
      </head>
      <body>
        <div id="app"></div>

        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
        <script>
          Scalar.createApiReference('#app', {
            url: '/spec.json',
          })
        </script>
      </body>
    </html>
  `;

		if (url.pathname === "/doc")
			return new Response(html, { headers: { "Content-Type": "text/html" } });

		return new Response("Not found", { status: 404 });
	},
});
