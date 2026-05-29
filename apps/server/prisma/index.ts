import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client/edge";

// Lazy init: Cloudflare validates the Worker before secrets are available,
// so we must not call neon() at module level.
// DATABASE_URL comes from the Worker env binding, not process.env.
let _databaseUrl: string | undefined;
let _client: PrismaClient | undefined;

export function initPrisma(databaseUrl: string): void {
	if (_databaseUrl !== databaseUrl) {
		_databaseUrl = databaseUrl;
		_client = undefined;
	}
}

function getClient(): PrismaClient {
	if (!_client) {
		const url = _databaseUrl ?? process.env.DATABASE_URL;
		if (!url) throw new Error("No database connection string was provided. Set DATABASE_URL via `wrangler secret put DATABASE_URL`.");
		const adapter = new PrismaNeonHttp(url, {});
		_client = new PrismaClient({ adapter });
	}
	return _client;
}

const prisma = new Proxy({} as PrismaClient, {
	get(_target, prop) {
		return (getClient() as unknown as Record<string | symbol, unknown>)[prop];
	},
});

export default prisma;
