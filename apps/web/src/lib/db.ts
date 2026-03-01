import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
	prisma = new PrismaClient();
} else {
	let globalPrisma: PrismaClient | undefined;
	if (!globalPrisma) {
		globalPrisma = new PrismaClient();
	}
	prisma = globalPrisma;
}

export default prisma;
