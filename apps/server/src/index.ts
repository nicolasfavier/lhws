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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _handler: OpenAPIHandler<any> | undefined;
let _handlerCorsOrigin: string | undefined;

function getHandler(corsOrigin: string) {
	if (!_handler || _handlerCorsOrigin !== corsOrigin) {
		_handler = new OpenAPIHandler(appRouter, {
			plugins: [new CORSPlugin({ origin: corsOrigin })],
		});
		_handlerCorsOrigin = corsOrigin;
	}
	return _handler;
}

const openAPIGenerator = new OpenAPIGenerator({
	schemaConverters: [new ZodToJsonSchemaConverter()],
});

async function processAsyncEvents() {
	// Hosts: STARTING → RUNNING or ERROR
	const startingHosts = await prisma.host.findMany({ where: { status: "STARTING" } });
	for (const host of startingHosts) {
		const newStatus = Math.random() > 0.1 ? "RUNNING" : "ERROR";
		await prisma.$executeRawUnsafe(
			`UPDATE "Host" SET status = $1::"HostStatus", "lastStatusChange" = NOW() WHERE id = $2::uuid`,
			newStatus,
			host.id,
		);
	}

	// Databases: CREATING / UPGRADING → RUNNING
	await prisma.$executeRaw`UPDATE "ManagedDatabase" SET status = 'RUNNING'::"ManagedDatabaseStatus", "lastStatusChange" = NOW() WHERE status IN ('CREATING'::"ManagedDatabaseStatus", 'UPGRADING'::"ManagedDatabaseStatus")`;

	// Backups: RUNNING → DONE (before advancing SCHEDULED, to require 2 cron ticks)
	await prisma.$executeRaw`UPDATE "DatabaseBackup" SET status = 'DONE'::"DatabaseBackupStatus" WHERE status = 'RUNNING'::"DatabaseBackupStatus"`;

	// Backups: SCHEDULED → RUNNING
	await prisma.$executeRaw`UPDATE "DatabaseBackup" SET status = 'RUNNING'::"DatabaseBackupStatus" WHERE status = 'SCHEDULED'::"DatabaseBackupStatus"`;
}

async function updateVmMetrics() {
	const vms = await prisma.vM.findMany({
		where: { status: "RUNNING" },
	});
	for (const input of vms) {
		const futureCpuAvg = Math.min(
			100,
			input.cpuAvgPercent + Math.random() * 10 - 5,
		);
		const futureRamAvg = Math.min(
			100,
			input.ramAvgPercent + Math.random() * 10 - 5,
		);
		await prisma.$executeRawUnsafe(
			`UPDATE "VM" SET "cpuPeakPercent" = $1, "ramPeakPercent" = $2, "cpuAvgPercent" = $3, "ramAvgPercent" = $4 WHERE id = $5::uuid`,
			Math.round(Math.max(input.cpuPeakPercent, futureCpuAvg)),
			Math.round(Math.max(input.ramPeakPercent, futureRamAvg)),
			Math.round(futureCpuAvg),
			Math.round(futureRamAvg),
			input.id,
		);
	}
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		initPrisma(env.DATABASE_URL);
		const corsOrigin = env.CORS_ORIGIN || "*";
		const handler = getHandler(corsOrigin);
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
		await processAsyncEvents();
	},
};
