import "dotenv/config";
import { OpenAPIGenerator } from "@orpc/openapi";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { CORSPlugin } from "@orpc/server/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
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
            if (request.method === 'OPTIONS') {
                return new Response(null, {
                    headers: {
                        'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
                        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    },
                });
            }
			const spec = await openAPIGenerator.generate(appRouter, {
				info: {
					title: "TakiWS",
					description: "QubeRT hackathon",
					version: "1.0.0",
				},
				servers: [
					{ url: "/api" } /** Should use absolute URLs in production */,
				],
			});

			return Response.json(JSON.stringify(spec), {
				headers: {
                    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
				},
            });
		}

		const html = `
    <!doctype html>
    <html>
      <head>
        <title>TakiWS OpenAPI Client</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="https://orpc.unnoq.com/icon.svg" />
      </head>
      <body>
        <div id="app"></div>

        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"
        data-proxy-url=""
        ></script>
        <script>
          Scalar.createApiReference('#app', {
            url: '/spec.json',
            proxy: '',
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
