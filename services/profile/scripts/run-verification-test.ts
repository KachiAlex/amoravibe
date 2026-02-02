import { VerificationService } from '../src/modules/verification/verification.service';

// Minimal in-memory mock of the Prisma verificationCode model
type VerificationRecord = {
  id: string;
  email?: string | null;
  phone?: string | null;
  code: string;
  method: 'email' | 'sms';
  expiresAt: Date;
  verified: boolean;
  verifiedAt?: Date | null;
};

class MockPrisma {
  verificationCode: {
    data: VerificationRecord[];
    updateMany: (args: any) => Promise<void>;
    create: (args: any) => Promise<VerificationRecord>;
    findFirst: (args: any) => Promise<VerificationRecord | null>;
    update: (args: any) => Promise<VerificationRecord>;
  };

  constructor() {
    this.verificationCode = {
      data: [],
      updateMany: async (args: any) => {
        const now = new Date();
        this.verificationCode.data = this.verificationCode.data.map((r) => {
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
        const rec: VerificationRecord = {
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

        const rec = this.verificationCode.data.find((r) => {
          // Match by code if provided
          if (where.code && r.code !== where.code) return false;

          // Match by direct email/phone fields
          if (where.email && r.email !== where.email) return false;
          if (where.phone && r.phone !== where.phone) return false;

          // Match by OR array (e.g., { OR: [{ email }, { phone }] })
          if (Array.isArray(where.OR) && where.OR.length > 0) {
            const matchesOR = where.OR.some((cond: any) => {
              if (cond.email && r.email === cond.email) return true;
              if (cond.phone && r.phone === cond.phone) return true;
              return false;
            });
            if (!matchesOR) return false;
          }

          // Verified flag constraints
          if (typeof where.verified === 'boolean' && r.verified !== where.verified) return false;

          // Expiration constraint (where.expiresAt: { gt: Date })
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
        const idx = this.verificationCode.data.findIndex((r) => r.id === id);
        if (idx === -1) throw new Error('Not found');
        const updated = { ...this.verificationCode.data[idx], ...args.data };
        this.verificationCode.data[idx] = updated;
        return updated;
      },
    };
  }
}

async function run() {
  const prisma = new MockPrisma() as any;
  const svc = new VerificationService(prisma);

  console.log('Creating verification code for test@example.com');
  const created = await svc.createVerificationCode('test@example.com', undefined, 'email');
  console.log('Created code:', created.code);

  console.log('Checking isVerified (should be false):', await svc.isVerified({ email: 'test@example.com' }));

  console.log('Verifying code...');
  const ok = await svc.verifyCode(created.code, 'test@example.com', undefined);
  console.log('verifyCode returned:', ok);

  console.log('Checking isVerified (should be true):', await svc.isVerified({ email: 'test@example.com' }));
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
