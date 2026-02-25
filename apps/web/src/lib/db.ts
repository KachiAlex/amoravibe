// PostgreSQL database connection using Prisma ORM
import { PrismaClient } from '@prisma/client';

let _prisma: PrismaClient | null = null;

function getPrismaClient() {
	if (!_prisma) {
		_prisma = new PrismaClient();
	}
	return _prisma;
}

const lazyPrisma = new Proxy(
	{},
	{
		get(_target, prop) {
			const client = getPrismaClient();
			// @ts-ignore
			return client[prop as keyof PrismaClient];
		},
		apply(_target, thisArg, args) {
			const client = getPrismaClient();
			// @ts-ignore
			return (client as any).apply(thisArg, args);
		},
	}
) as unknown as PrismaClient;

export default lazyPrisma;
