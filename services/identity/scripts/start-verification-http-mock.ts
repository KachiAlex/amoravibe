import express from 'express';
import bodyParser from 'body-parser';
import { VerificationService } from '../src/modules/verification/services/verification.service';

// Minimal in-memory mocks
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

const app = express();
app.use(bodyParser.json());

const prisma = new MockPrisma() as any;
const verificationService = new VerificationService(prisma, new MockUserService() as any, new MockAuditService() as any);

app.post('/verifications', async (req, res) => {
  try {
    const result = await verificationService.initiate(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/verifications/:id/complete', async (req, res) => {
  try {
    const result = await verificationService.complete(req.params.id);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/verifications/:id', async (req, res) => {
  try {
    const result = await verificationService.findById(req.params.id);
    if (!result) return res.status(404).json({ error: 'not found' });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const port = 4002;
app.listen(port, () => console.log(`Verification HTTP mock listening on http://localhost:${port}`));
