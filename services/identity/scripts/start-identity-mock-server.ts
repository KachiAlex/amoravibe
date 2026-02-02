import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuditService } from '../src/modules/audit/services/audit.service';
import { UserService } from '../src/modules/user/services/user.service';

class MockVerificationDelegate {
  data: any[] = [];

  async create(args: any) {
    const rec = {
      id: `${Math.floor(Math.random() * 1000000)}`,
      userId: args.data.userId,
      provider: args.data.provider,
      status: args.data.status,
      reference: null,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.push(rec);
    return rec;
  }

  async findUnique(args: any) {
    const id = args.where.id;
    return this.data.find((r) => r.id === id) ?? null;
  }

  async update(args: any) {
    const id = args.where.id;
    const idx = this.data.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Not found');
    const updated = { ...this.data[idx], ...args.data, updatedAt: new Date() };
    this.data[idx] = updated;
    return updated;
  }
}

async function start() {
  // Prevent real Prisma client from connecting
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  PrismaService.prototype.$connect = async function () {
    /* noop */
  };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  PrismaService.prototype.$disconnect = async function () {
    /* noop */
  };

  // Provide prototype-level mock delegates so modules that access prisma during
  // initialization won't attempt real DB calls.
  class GenericDelegate {
    data: any[] = [];
    async create(args: any) {
      const rec = { id: `${Math.floor(Math.random() * 1000000)}`, ...args.data, createdAt: new Date(), updatedAt: new Date() };
      this.data.push(rec);
      return rec;
    }
    async findMany(args: any) {
      return [];
    }
    async findUnique(args: any) {
      return this.data.find((r) => r.id === args.where?.id) ?? null;
    }
    async update(args: any) {
      const idx = this.data.findIndex((r) => r.id === args.where.id);
      if (idx === -1) throw new Error('Not found');
      this.data[idx] = { ...this.data[idx], ...args.data, updatedAt: new Date() };
      return this.data[idx];
    }
    async deleteMany() {
      return { count: 0 };
    }
    async delete() {
      return null;
    }
  }

  // Attach common delegates to PrismaService prototype before Nest initializes modules
  // so any service requesting prisma.auditEvent, prisma.auditExportRequest, etc.
  // gets a harmless mock.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  PrismaService.prototype.verification = new MockVerificationDelegate();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  PrismaService.prototype.auditEvent = new GenericDelegate();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  PrismaService.prototype.auditExportRequest = new GenericDelegate();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  PrismaService.prototype.auditPurgeRequest = new GenericDelegate();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  PrismaService.prototype.user = new GenericDelegate();

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // After app creation, also ensure AuditService and UserService methods are no-ops
  const audit = app.get(AuditService) as any;
  if (audit) {
    audit.logVerificationInitiated = async () => undefined;
    audit.logVerificationStatusChange = async () => undefined;
  }

  const user = app.get(UserService) as any;
  if (user) {
    user.markVerified = async (id: string) => ({ id, isVerified: true });
  }

  const port = process.env.PORT ?? 4001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Identity mock server listening on http://localhost:${port}`);
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start identity mock server', err);
  process.exit(1);
});
