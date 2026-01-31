import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from './client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private connectionPromise: Promise<void> | null = null;

  async onModuleInit() {
    // Don't wait for connection on startup to avoid blocking lambda init
    // Connection will be established on first query
    this.connectionPromise = this.$connect().catch((error) => {
      console.error('[PrismaService] Connection error:', error);
    });
  }

  async onModuleDestroy() {
    if (this.connectionPromise) {
      await this.connectionPromise;
    }
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit' as never, async () => {
      await app.close();
    });
  }
}
