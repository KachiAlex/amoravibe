import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { NestFactory } from '@nestjs/core';

class MockPrismaService {
  verificationCode: any;

  constructor() {
    this.verificationCode = {
      data: [],
      updateMany: async (args: any) => {
        const now = new Date();
        this.verificationCode.data = this.verificationCode.data.map((r: any) => {
          const matches = (args.where.OR || []).some((cond: any) => {
            if (cond.email && cond.email === args.where.OR[0].email) return true;
            if (cond.phone && cond.phone === args.where.OR[0].phone) return true;
            return false;
          });
          if (matches && r.verified === false && r.expiresAt > now) {
            return { ...r, expiresAt: new Date() };
          }
          return r;
        });
      },
      create: async (args: any) => {
        const rec = {
          id: `${Math.floor(Math.random() * 1000000)}`,
          email: args.data.email ?? null,
          phone: args.data.phone ?? null,
          code: args.data.code,
          method: args.data.method,
          expiresAt: args.data.expiresAt,
          verified: false,
        };
        this.verificationCode.data.push(rec);
        return rec;
      },
      findFirst: async (args: any) => {
        const where = args.where || {};
        const now = new Date();
        const rec = this.verificationCode.data.find((r: any) => {
          if (where.code && r.code !== where.code) return false;
          if (where.email && r.email !== where.email) return false;
          if (where.phone && r.phone !== where.phone) return false;
          if (Array.isArray(where.OR) && where.OR.length > 0) {
            const matchesOR = where.OR.some((cond: any) => {
              if (cond.email && r.email === cond.email) return true;
              if (cond.phone && r.phone === cond.phone) return true;
              return false;
            });
            if (!matchesOR) return false;
          }
          if (typeof where.verified === 'boolean' && r.verified !== where.verified) return false;
          if (where.expiresAt && typeof where.expiresAt.gt !== 'undefined') {
            const gt = new Date(where.expiresAt.gt);
            if (!(r.expiresAt > gt)) return false;
          }
          return true;
        });
        return rec ?? null;
      },
      update: async (args: any) => {
        const id = args.where.id;
        const idx = this.verificationCode.data.findIndex((r: any) => r.id === id);
        if (idx === -1) throw new Error('Not found');
        const updated = { ...this.verificationCode.data[idx], ...args.data };
        this.verificationCode.data[idx] = updated;
        return updated;
      },
    };
  }

  // Prisma client lifecycle methods used by PrismaService
  async $connect() {
    // no-op for mock
  }
  async $disconnect() {
    // no-op for mock
  }
}


async function start() {
  // Prevent the real Prisma client from attempting to connect
  // by stubbing lifecycle methods on the PrismaService prototype.
  // This avoids needing a real DATABASE_URL for the mock server.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  PrismaService.prototype.$connect = async function () {
    /* no-op */
  };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  PrismaService.prototype.$disconnect = async function () {
    /* no-op */
  };

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Replace the instantiated PrismaService with a mock implementation
  const realPrisma = app.get(PrismaService) as any;
  const mock = new MockPrismaService();
  // Copy mock methods onto the real instance to satisfy references
  realPrisma.verificationCode = mock.verificationCode;
  realPrisma.$connect = mock.$connect;
  realPrisma.$disconnect = mock.$disconnect;

  const port = process.env.PORT ?? 3101;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Profile mock server listening on http://localhost:${port}`);
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start profile mock server', err);
  process.exit(1);
});
