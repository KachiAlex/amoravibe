import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;
let connectionAttempts = 0;
const MAX_RETRIES = 3;

function getPrisma() {
	if (prisma) return prisma;

	try {
		prisma = new PrismaClient({
			log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
		});

		connectionAttempts = 0;
		return prisma;
	} catch (err) {
		connectionAttempts++;
		console.error(`[Prisma] Initialization failed (attempt ${connectionAttempts}/${MAX_RETRIES}):`, err);
		
		if (connectionAttempts < MAX_RETRIES) {
			// Reset for retry
			prisma = null;
			throw err;
		}
		throw err;
	}
}

const handler = new Proxy({} as PrismaClient, {
	get(target, prop) {
		try {
			const client = getPrisma();
			return (client as any)[prop];
		} catch (err) {
			console.error('[Prisma] Error accessing property:', prop, err);
			throw err;
		}
	},
});

export default handler as PrismaClient;
