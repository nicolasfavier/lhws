import { OpenAPIGenerator } from "@orpc/openapi";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { CORSPlugin } from "@orpc/server/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { appRouter } from "@server/routers";
import prisma, { initPrisma } from "../prisma";

interface Env {
	DATABASE_URL: string;
	CORS_ORIGIN?: string;
}

function makeHandler(corsOrigin: string) {
	return new OpenAPIHandler(appRouter, {
		plugins: [new CORSPlugin({ origin: corsOrigin })],
	});
}

const openAPIGenerator = new OpenAPIGenerator({
	schemaConverters: [new ZodToJsonSchemaConverter()],
});

async function updateVmMetrics() {
	const vms = await prisma.vM.findMany({
		where: { status: "RUNNING" },
	});
	await Promise.all(
		vms.map((input) => {
			const futureCpuAvg = Math.min(
				100,
				input.cpuAvgPercent + Math.random() * 10 - 5,
			);
			const futureRamAvg = Math.min(
				100,
				input.ramAvgPercent + Math.random() * 10 - 5,
			);
			return prisma.vM.update({
				where: { id: input.id },
				data: {
					vCPU: input.vCPU,
					ramGB: input.ramGB,
					cpuPeakPercent: Math.max(input.cpuPeakPercent, futureCpuAvg),
					ramPeakPercent: Math.max(input.ramPeakPercent, futureRamAvg),
					cpuAvgPercent: futureCpuAvg,
					ramAvgPercent: futureRamAvg,
					lastStatusChange: input.lastStatusChange,
				},
			});
		}),
	);
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		initPrisma(env.DATABASE_URL);
		const corsOrigin = env.CORS_ORIGIN || "*";
		const handler = makeHandler(corsOrigin);
		const url = new URL(request.url);

		const { matched, response } = await handler.handle(request, {
			prefix: "/api",
		});

		if (matched) {
			return response;
		}

		if (url.pathname === "/spec.json") {
			if (request.method === "OPTIONS") {
				return new Response(null, {
					headers: {
						"Access-Control-Allow-Origin": corsOrigin,
						"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
						"Access-Control-Allow-Headers": "Content-Type, Authorization",
					},
				});
			}
			const spec = await openAPIGenerator.generate(appRouter, {
				info: {
					title: "TakiWS",
					description: "QubeRT hackathon",
					version: "1.0.0",
				},
				servers: [{ url: "/api" }],
			});

			return Response.json(spec, {
				headers: {
					"Access-Control-Allow-Origin": corsOrigin,
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

	async scheduled(_event: unknown, env: Env): Promise<void> {
		initPrisma(env.DATABASE_URL);
		await updateVmMetrics();
	},
};
