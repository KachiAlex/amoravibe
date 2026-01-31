/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata';
import express from 'express';
const serverless = require('serverless-http');
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

let handler: any;
let initError: Error | null = null;

async function createHandler() {
  const app = express();
  const adapter = new ExpressAdapter(app);
  const nestApp = await NestFactory.create(AppModule, adapter, {
    logger: ['log', 'warn', 'error'],
  });
  nestApp.setGlobalPrefix('api/v1', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });
  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  await nestApp.init();
  return serverless(app);
}

export default async function (req: any, res: any) {
  try {
    if (!handler) {
      try {
        handler = await createHandler();
      } catch (error) {
        initError = error as Error;
        console.error('[Lambda Init Error]', error);
        return res.status(500).json({
          error: 'Lambda initialization failed',
          message: initError?.message,
        });
      }
    }
    return handler(req, res);
  } catch (error) {
    console.error('[Lambda Handler Error]', error);
    return res.status(500).json({ error: 'Request handler failed' });
  }
}
