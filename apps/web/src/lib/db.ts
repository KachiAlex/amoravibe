// Lazy PostgreSQL database connection using Prisma ORM.
// Avoid importing `@prisma/client` at module scope so Next.js build-time
// collection doesn't instantiate Prisma on the build server.
let _prisma: any = null;

function getPrismaClient() {
	if (!_prisma) {
		// require at runtime so bundlers and build collectors don't evaluate Prisma code.
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { PrismaClient } = require('@prisma/client');
		_prisma = new PrismaClient();
	}
	return _prisma;
}

const lazyPrisma = new Proxy(
	{},
	{
		get(_target, prop) {
			const client = getPrismaClient();
			return client[prop as keyof typeof client];
		},
		apply(_target, thisArg, args) {
			const client = getPrismaClient();
			return (client as any).apply(thisArg, args);
		},
	}
) as unknown as any;

export default lazyPrisma;
