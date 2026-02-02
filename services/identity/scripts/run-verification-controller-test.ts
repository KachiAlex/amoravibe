import { VerificationController } from '../src/modules/verification/controllers/verification.controller';
import { VerificationService } from '../src/modules/verification/services/verification.service';

// Minimal mock Prisma with verification delegate
class MockVerificationDelegate {
  data: any[] = [];
  async create(args: any) {
    const rec = { id: `${Math.floor(Math.random() * 1000000)}`, ...args.data, createdAt: new Date(), updatedAt: new Date() };
    this.data.push(rec);
    return rec;
  }
  async findUnique(args: any) {
    return this.data.find((r) => r.id === args.where.id) ?? null;
  }
  async update(args: any) {
    const idx = this.data.findIndex((r) => r.id === args.where.id);
    if (idx === -1) throw new Error('Not found');
    this.data[idx] = { ...this.data[idx], ...args.data, updatedAt: new Date() };
    return this.data[idx];
  }
}

class MockPrisma {
  verification = new MockVerificationDelegate();
}

class MockUserService {
  async markVerified(id: string) {
    return { id, isVerified: true };
  }
}

class MockAuditService {
  async logVerificationInitiated() {
    return undefined;
  }
  async logVerificationStatusChange() {
    return undefined;
  }
}

async function run() {
  const prisma = new MockPrisma() as any;
  const svc = new VerificationService(prisma, new MockUserService() as any, new MockAuditService() as any);
  const ctrl = new VerificationController(svc as any);

  console.log('Initiating verification');
  const created = await ctrl.initiate({ userId: 'u1', kycProvider: 'mock', targetStatus: undefined } as any);
  console.log('Created:', created);

  console.log('Completing verification');
  const completed = await ctrl.complete(created.id);
  console.log('Completed:', completed);

  console.log('Fetching by id');
  const fetched = await ctrl.getById(created.id);
  console.log('Fetched:', fetched);
}

run().catch((err) => {
  console.error('Controller test failed:', err);
  process.exit(1);
});
