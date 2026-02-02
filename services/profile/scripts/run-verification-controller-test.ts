import { VerificationController } from '../src/modules/verification/verification.controller';
import { VerificationService } from '../src/modules/verification/verification.service';

// Simple mock EmailService
class MockEmailService {
  sent: Array<{ to: string; code: string }> = [];
  async sendVerificationEmail(to: string, code: string) {
    this.sent.push({ to, code });
    console.log(`MockEmailService: sent code ${code} to ${to}`);
  }
}

// Reuse the in-memory MockPrisma logic from the run-verification-test script
class MockPrisma {
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
}

async function runControllerTest() {
  const prisma = new MockPrisma() as any;
  const verificationService = new VerificationService(prisma);
  const emailService = new MockEmailService();
  const controller = new VerificationController(verificationService, emailService as any);

  console.log('Controller: sending code to alice@example.com');
  const sendResult = await controller.sendCode({ email: 'alice@example.com', method: 'email' });
  console.log('sendCode result:', sendResult);

  // Inspect mock email to retrieve code
  const sent = (emailService as any).sent[0];
  if (!sent) throw new Error('No email sent by controller');

  console.log('Controller: verifying with received code');
  const verifyResult = await controller.verifyCode({ email: 'alice@example.com', code: sent.code });
  console.log('verifyCode result:', verifyResult);

  console.log('Controller: checkVerification');
  const check = await controller.checkVerification({ email: 'alice@example.com' });
  console.log('checkVerification result:', check);
}

runControllerTest().catch((err) => {
  console.error('Controller test failed:', err);
  process.exit(1);
});
